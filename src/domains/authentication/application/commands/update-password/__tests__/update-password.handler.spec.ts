/* eslint-disable */
// Set JWT_SECRET before any imports to avoid module initialization errors
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdatePasswordHandler } from '../update-password.handler';
import { UpdatePasswordDTO } from '../update-password.dto';
import { IAuthRepository } from '../../../../aggregates/repositories/authentication.interface';
import { PasswordResetRateLimiter } from '../../../../infrastructure/rate-limiting/password-reset-rate-limiter';
import { AuthenticationMapper } from '../../../mappers';
import {
  verifyPasswordResetToken,
  invalidateToken,
} from '../../../../infrastructure/jwt';
import { Id } from '../../../../aggregates/value-objects';
import { v7 as uuid } from 'uuid';

// Mock the JWT functions
jest.mock('../../../../infrastructure/jwt', () => ({
  verifyPasswordResetToken: jest.fn(),
  invalidateToken: jest.fn(),
  generatePasswordResetToken: jest.fn(),
}));

// Mock the AuthenticationMapper
jest.mock('../../../mappers', () => ({
  AuthenticationMapper: {
    fromUpdateDto: jest.fn(),
  },
}));

// Mock the Id value object
jest.mock('../../../../aggregates/value-objects', () => ({
  Id: {
    create: jest.fn(),
  },
}));

interface MockUser {
  get: jest.Mock;
  commit: jest.Mock;
}

interface MockUpdatedUser extends MockUser {
  commit: jest.Mock;
}

describe('UpdatePasswordHandler', () => {
  let handler: UpdatePasswordHandler;
  let authRepository: jest.Mocked<IAuthRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let rateLimiter: jest.Mocked<PasswordResetRateLimiter>;
  let mockUser: MockUser;
  let mockUpdatedUser: MockUpdatedUser;

  const validToken = 'valid-reset-token';
  const validPassword = 'newPassword123!';
  const userEmail = 'test@example.com';
  const userId = uuid();
  const tokenPayload = {
    email: userEmail,
    authIdentityId: userId,
    purpose: 'password_reset' as const,
  };

  beforeEach(async () => {
    // Mock Id.create to return a mock Id object
    (Id.create as jest.Mock).mockReturnValue({
      getValue: () => userId,
    });

    // Create mock user objects
    mockUser = {
      get: jest.fn(),
      commit: jest.fn(),
    };

    mockUpdatedUser = {
      get: jest.fn(),
      commit: jest.fn(),
    };

    // Mock repository
    authRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    // Mock event publisher
    eventPublisher = {
      mergeObjectContext: jest.fn(),
    } as unknown as jest.Mocked<EventPublisher>;

    // Mock rate limiter
    rateLimiter = {
      clearAttempts: jest.fn(),
    } as unknown as jest.Mocked<PasswordResetRateLimiter>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePasswordHandler,
        {
          provide: 'AuthRepository',
          useValue: authRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: PasswordResetRateLimiter,
          useValue: rateLimiter,
        },
      ],
    }).compile();

    handler = module.get<UpdatePasswordHandler>(UpdatePasswordHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseCommand = new UpdatePasswordDTO(validToken, validPassword);

    describe('Successful password update', () => {
      beforeEach(() => {
        // Setup successful flow mocks
        (verifyPasswordResetToken as jest.Mock).mockReturnValue(tokenPayload);

        mockUser.get.mockImplementation((field: string) => {
          if (field === 'id') {
            return { getValue: () => userId };
          }
          if (field === 'email') {
            return { getValue: () => userEmail };
          }
          return { getValue: () => 'mock-value' };
        });

        mockUpdatedUser.get.mockImplementation((field: string) => {
          if (field === 'id') {
            return { getValue: () => userId };
          }
          return { getValue: () => 'mock-value' };
        });

        authRepository.findById.mockResolvedValue(mockUser as any);
        authRepository.update.mockResolvedValue(mockUpdatedUser as any);
        eventPublisher.mergeObjectContext.mockReturnValue(
          mockUpdatedUser as any,
        );
        (AuthenticationMapper.fromUpdateDto as jest.Mock).mockReturnValue(
          mockUpdatedUser,
        );
      });

      it('should successfully update password and return success response', async () => {
        const result = await handler.execute(baseCommand);

        expect(result).toEqual({
          success: true,
          message:
            'Password updated successfully. All reset tokens have been invalidated.',
        });
      });

      it('should verify the password reset token', async () => {
        await handler.execute(baseCommand);

        expect(verifyPasswordResetToken).toHaveBeenCalledWith(validToken);
      });

      it('should find user by ID from token payload', async () => {
        await handler.execute(baseCommand);

        expect(authRepository.findById).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );

        // Verify the ID value object was created correctly
        await handler.execute(baseCommand);
        expect(Id.create).toHaveBeenCalledWith(userId);
      });

      it('should verify email matches between user and token', async () => {
        await handler.execute(baseCommand);

        expect(mockUser.get).toHaveBeenCalledWith('email');
      });

      it('should update user password using domain mapper', async () => {
        await handler.execute(baseCommand);

        expect(AuthenticationMapper.fromUpdateDto).toHaveBeenCalledWith(
          mockUser,
          validPassword,
        );
      });

      it('should merge updated user with event publisher context', async () => {
        await handler.execute(baseCommand);

        expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
          mockUpdatedUser,
        );
      });

      it('should update user in repository', async () => {
        await handler.execute(baseCommand);

        expect(authRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
          mockUpdatedUser,
        );
      });

      it('should invalidate the used token', async () => {
        await handler.execute(baseCommand);

        expect(invalidateToken).toHaveBeenCalledWith(validToken);
      });

      it('should clear rate limiting attempts for the email', async () => {
        await handler.execute(baseCommand);

        expect(rateLimiter.clearAttempts).toHaveBeenCalledWith(userEmail);
      });

      it('should commit events on the updated user', async () => {
        await handler.execute(baseCommand);

        expect(mockUpdatedUser.commit).toHaveBeenCalled();
      });
    });

    describe('Token verification errors', () => {
      beforeEach(() => {
        authRepository.findById.mockResolvedValue(mockUser as any);
      });

      it('should throw BadRequestException for invalid token', async () => {
        (verifyPasswordResetToken as jest.Mock).mockImplementation(() => {
          throw new Error('JsonWebTokenError');
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          BadRequestException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Invalid or expired reset token',
        );
      });

      it('should throw BadRequestException for expired token', async () => {
        (verifyPasswordResetToken as jest.Mock).mockImplementation(() => {
          throw new Error('TokenExpiredError');
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          BadRequestException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Invalid or expired reset token',
        );
      });

      it('should not call repository or other services when token is invalid', async () => {
        (verifyPasswordResetToken as jest.Mock).mockImplementation(() => {
          throw new Error('JsonWebTokenError');
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow();

        expect(authRepository.findById).not.toHaveBeenCalled();
        expect(authRepository.update).not.toHaveBeenCalled();
        expect(invalidateToken).not.toHaveBeenCalled();
        expect(rateLimiter.clearAttempts).not.toHaveBeenCalled();
      });
    });

    describe('User not found errors', () => {
      beforeEach(() => {
        (verifyPasswordResetToken as jest.Mock).mockReturnValue(tokenPayload);
      });

      it('should throw NotFoundException when user does not exist', async () => {
        authRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'User not found',
        );
      });

      it('should not proceed with password update when user not found', async () => {
        authRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow();

        expect(AuthenticationMapper.fromUpdateDto).not.toHaveBeenCalled();
        expect(authRepository.update).not.toHaveBeenCalled();
        expect(invalidateToken).not.toHaveBeenCalled();
        expect(rateLimiter.clearAttempts).not.toHaveBeenCalled();
      });
    });

    describe('Email mismatch security check', () => {
      beforeEach(() => {
        (verifyPasswordResetToken as jest.Mock).mockReturnValue(tokenPayload);
        authRepository.findById.mockResolvedValue(mockUser as any);
      });

      it('should throw BadRequestException when email does not match', async () => {
        mockUser.get.mockImplementation((field: string) => {
          if (field === 'email') {
            return { getValue: () => 'different@example.com' };
          }
          if (field === 'id') {
            return { getValue: () => userId };
          }
          return { getValue: () => 'mock-value' };
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          BadRequestException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Invalid reset token',
        );
      });

      it('should not proceed with password update when email mismatch', async () => {
        mockUser.get.mockImplementation((field: string) => {
          if (field === 'email') {
            return { getValue: () => 'different@example.com' };
          }
          if (field === 'id') {
            return { getValue: () => userId };
          }
          return { getValue: () => 'mock-value' };
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow();

        expect(AuthenticationMapper.fromUpdateDto).not.toHaveBeenCalled();
        expect(authRepository.update).not.toHaveBeenCalled();
        expect(invalidateToken).not.toHaveBeenCalled();
        expect(rateLimiter.clearAttempts).not.toHaveBeenCalled();
      });
    });

    describe('Repository errors', () => {
      beforeEach(() => {
        (verifyPasswordResetToken as jest.Mock).mockReturnValue(tokenPayload);
        mockUser.get.mockImplementation((field: string) => {
          if (field === 'id') {
            return { getValue: () => userId };
          }
          if (field === 'email') {
            return { getValue: () => userEmail };
          }
          return { getValue: () => 'mock-value' };
        });
        authRepository.findById.mockResolvedValue(mockUser as any);
        eventPublisher.mergeObjectContext.mockReturnValue(
          mockUpdatedUser as any,
        );
        (AuthenticationMapper.fromUpdateDto as jest.Mock).mockReturnValue(
          mockUpdatedUser,
        );
      });

      it('should propagate repository update errors', async () => {
        const repositoryError = new Error('Database connection failed');
        authRepository.update.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should not invalidate token or clear rate limits on repository error', async () => {
        const repositoryError = new Error('Database connection failed');
        authRepository.update.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow();

        expect(invalidateToken).not.toHaveBeenCalled();
        expect(rateLimiter.clearAttempts).not.toHaveBeenCalled();
        expect(mockUpdatedUser.commit).not.toHaveBeenCalled();
      });
    });

    describe('Edge cases', () => {
      beforeEach(() => {
        (verifyPasswordResetToken as jest.Mock).mockReturnValue(tokenPayload);
        mockUser.get.mockImplementation((field: string) => {
          if (field === 'id') {
            return { getValue: () => userId };
          }
          if (field === 'email') {
            return { getValue: () => userEmail };
          }
          return { getValue: () => 'mock-value' };
        });
        authRepository.findById.mockResolvedValue(mockUser as any);
        eventPublisher.mergeObjectContext.mockReturnValue(
          mockUpdatedUser as any,
        );
        (AuthenticationMapper.fromUpdateDto as jest.Mock).mockReturnValue(
          mockUpdatedUser,
        );
        authRepository.update.mockResolvedValue(mockUpdatedUser as any);
      });

      it('should handle empty password', async () => {
        const emptyPasswordCommand = new UpdatePasswordDTO(validToken, '');

        const result = await handler.execute(emptyPasswordCommand);

        expect(AuthenticationMapper.fromUpdateDto).toHaveBeenCalledWith(
          mockUser,
          '',
        );
        expect(result.success).toBe(true);
      });

      it('should handle very long password', async () => {
        const longPassword = 'a'.repeat(1000);
        const longPasswordCommand = new UpdatePasswordDTO(
          validToken,
          longPassword,
        );

        const result = await handler.execute(longPasswordCommand);

        expect(AuthenticationMapper.fromUpdateDto).toHaveBeenCalledWith(
          mockUser,
          longPassword,
        );
        expect(result.success).toBe(true);
      });

      it('should handle special characters in password', async () => {
        const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const specialPasswordCommand = new UpdatePasswordDTO(
          validToken,
          specialPassword,
        );

        const result = await handler.execute(specialPasswordCommand);

        expect(AuthenticationMapper.fromUpdateDto).toHaveBeenCalledWith(
          mockUser,
          specialPassword,
        );
        expect(result.success).toBe(true);
      });
    });

    describe('Error propagation', () => {
      it('should propagate unexpected errors without modification', async () => {
        const unexpectedError = new Error('Unexpected system error');
        (verifyPasswordResetToken as jest.Mock).mockImplementation(() => {
          throw unexpectedError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Unexpected system error',
        );
      });

      it('should propagate domain validation errors', async () => {
        (verifyPasswordResetToken as jest.Mock).mockReturnValue(tokenPayload);
        mockUser.get.mockImplementation((field: string) => {
          if (field === 'id') {
            return { getValue: () => userId };
          }
          if (field === 'email') {
            return { getValue: () => userEmail };
          }
          return { getValue: () => 'mock-value' };
        });
        authRepository.findById.mockResolvedValue(mockUser as any);

        const domainError = new Error('Password does not meet requirements');
        (AuthenticationMapper.fromUpdateDto as jest.Mock).mockImplementation(
          () => {
            throw domainError;
          },
        );

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Password does not meet requirements',
        );
      });
    });
  });
});
