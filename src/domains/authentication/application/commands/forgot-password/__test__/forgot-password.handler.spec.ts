/* eslint-disable  */
// Set JWT_SECRET before any imports to avoid module initialization errors
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ForgotPasswordHandler } from '../forgot-password.handler';
import { ForgotPasswordDTO } from '../forgot-password.dto';
import { IAuthRepository } from '../../../../aggregates/repositories/authentication.interface';
import { AuthEmailService } from '../../../../infrastructure/emails/auth-email.service';
import { PasswordResetRateLimiter } from '../../../../infrastructure/rate-limiting/password-reset-rate-limiter';
import {
  Email,
  AccountType,
  AccountTypeEnum,
} from '../../../../aggregates/value-objects';

interface MockUser {
  get: jest.Mock;
}

describe('ForgotPasswordHandler', () => {
  let handler: ForgotPasswordHandler;
  let authRepository: jest.Mocked<IAuthRepository>;
  let authEmailService: jest.Mocked<AuthEmailService>;
  let rateLimiter: jest.Mocked<PasswordResetRateLimiter>;
  let mockUser: MockUser;
  const validEmail = 'test@example.com';
  const validAccountType = AccountTypeEnum.CUSTOMER;
  const validLocale = 'en';
  const userId = 'user-123';

  beforeEach(async () => {
    mockUser = {
      get: jest.fn(),
    };

    authRepository = {
      findByEmailAndAccountType: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    authEmailService = {
      sendPasswordResetEmail: jest.fn(),
    } as unknown as jest.Mocked<AuthEmailService>;

    rateLimiter = {
      isRateLimited: jest.fn(),
      recordAttempt: jest.fn(),
      getTimeUntilReset: jest.fn(),
    } as unknown as jest.Mocked<PasswordResetRateLimiter>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordHandler,
        {
          provide: 'AuthRepository',
          useValue: authRepository,
        },
        {
          provide: 'AuthEmailService',
          useValue: authEmailService,
        },
        {
          provide: PasswordResetRateLimiter,
          useValue: rateLimiter,
        },
      ],
    }).compile();

    handler = module.get<ForgotPasswordHandler>(ForgotPasswordHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseCommand = new ForgotPasswordDTO(
      validEmail,
      validAccountType,
      validLocale,
    );

    describe('Rate limiting', () => {
      beforeEach(() => {
        rateLimiter.isRateLimited.mockReturnValue(false);
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);
      });

      it('should throw BadRequestException when rate limited', async () => {
        rateLimiter.isRateLimited.mockReturnValue(true);
        rateLimiter.getTimeUntilReset.mockReturnValue(45);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          BadRequestException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Too many password reset attempts. Please try again in 45 minutes.',
        );
      });

      it('should check rate limiting before any other operations', async () => {
        rateLimiter.isRateLimited.mockReturnValue(true);
        rateLimiter.getTimeUntilReset.mockReturnValue(30);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          BadRequestException,
        );

        expect(rateLimiter.isRateLimited).toHaveBeenCalledWith(validEmail);
        expect(authRepository.findByEmailAndAccountType).not.toHaveBeenCalled();
        expect(rateLimiter.recordAttempt).not.toHaveBeenCalled();
      });

      it('should record attempt when not rate limited', async () => {
        await handler.execute(baseCommand);

        expect(rateLimiter.recordAttempt).toHaveBeenCalledWith(validEmail);
      });

      it('should record attempt even when user does not exist', async () => {
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        await handler.execute(baseCommand);

        expect(rateLimiter.recordAttempt).toHaveBeenCalledWith(validEmail);
      });

      it('should record attempt even when user exists', async () => {
        mockUser.get.mockReturnValue({ getValue: () => userId });
        authRepository.findByEmailAndAccountType.mockResolvedValue(
          mockUser as any,
        );

        await handler.execute(baseCommand);

        expect(rateLimiter.recordAttempt).toHaveBeenCalledWith(validEmail);
      });
    });

    describe('Email and AccountType validation', () => {
      beforeEach(() => {
        rateLimiter.isRateLimited.mockReturnValue(false);
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);
      });

      it('should create Email value object with provided email', async () => {
        const emailCreateSpy = jest.spyOn(Email, 'create');

        await handler.execute(baseCommand);

        expect(emailCreateSpy).toHaveBeenCalledWith(validEmail);
      });

      it('should create AccountType value object with provided account type', async () => {
        const accountTypeCreateSpy = jest.spyOn(AccountType, 'create');

        await handler.execute(baseCommand);

        expect(accountTypeCreateSpy).toHaveBeenCalledWith(validAccountType);
      });

      it('should handle invalid email format', async () => {
        const invalidEmailCommand = new ForgotPasswordDTO(
          'invalid-email',
          validAccountType,
          validLocale,
        );

        jest.spyOn(Email, 'create').mockImplementation(() => {
          throw new Error('Invalid email format');
        });

        await expect(handler.execute(invalidEmailCommand)).rejects.toThrow(
          'Invalid email format',
        );
      });

      it('should handle invalid account type', async () => {
        const invalidAccountTypeCommand = new ForgotPasswordDTO(
          validEmail,
          'INVALID_TYPE' as AccountTypeEnum,
          validLocale,
        );

        jest.spyOn(AccountType, 'create').mockImplementation(() => {
          throw new Error('Invalid account type');
        });

        await expect(
          handler.execute(invalidAccountTypeCommand),
        ).rejects.toThrow('Invalid account type');
      });
    });

    describe('User existence check', () => {
      beforeEach(() => {
        rateLimiter.isRateLimited.mockReturnValue(false);
      });

      it('should query repository with correct email and account type', async () => {
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        await handler.execute(baseCommand);

        expect(authRepository.findByEmailAndAccountType).toHaveBeenCalledWith(
          expect.any(Object), // Email value object
          expect.any(Object), // AccountType value object
        );
      });

      it('should return success message when user does not exist', async () => {
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        const result = await handler.execute(baseCommand);

        expect(result).toEqual({
          success: true,
          message:
            'If the email exists in our system, a password reset link has been sent.',
        });
        expect(authEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      });

      it('should send email when user exists', async () => {
        mockUser.get.mockReturnValue({ getValue: () => userId });
        authRepository.findByEmailAndAccountType.mockResolvedValue(
          mockUser as any,
        );

        const result = await handler.execute(baseCommand);

        expect(authEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
          validEmail,
          userId,
          validLocale,
        );
        expect(result).toEqual({
          success: true,
          message:
            'If the email exists in our system, a password reset link has been sent.',
        });
      });
    });

    describe('Email service integration', () => {
      beforeEach(() => {
        rateLimiter.isRateLimited.mockReturnValue(false);
        mockUser.get.mockReturnValue({ getValue: () => userId });
        authRepository.findByEmailAndAccountType.mockResolvedValue(
          mockUser as any,
        );
      });

      it('should call email service with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(authEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
          validEmail,
          userId,
          validLocale,
        );
      });

      it('should pass different locales to email service', async () => {
        const locales = ['en', 'es', 'fr', 'it', 'pt'];

        for (const locale of locales) {
          const command = new ForgotPasswordDTO(
            validEmail,
            validAccountType,
            locale,
          );

          await handler.execute(command);

          expect(authEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
            validEmail,
            userId,
            locale,
          );
        }
      });

      it('should handle email service errors', async () => {
        const emailError = new Error('Email service unavailable');
        authEmailService.sendPasswordResetEmail.mockRejectedValue(emailError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(emailError);
      });

      it('should not send email when user does not exist', async () => {
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        await handler.execute(baseCommand);

        expect(authEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      });
    });

    describe('Security considerations', () => {
      beforeEach(() => {
        rateLimiter.isRateLimited.mockReturnValue(false);
      });

      it('should return same message regardless of user existence', async () => {
        const expectedMessage =
          'If the email exists in our system, a password reset link has been sent.';

        // Test when user does not exist
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);
        const resultNoUser = await handler.execute(baseCommand);

        // Test when user exists
        mockUser.get.mockReturnValue({ getValue: () => userId });
        authRepository.findByEmailAndAccountType.mockResolvedValue(
          mockUser as any,
        );
        const resultWithUser = await handler.execute(baseCommand);

        expect(resultNoUser.message).toBe(expectedMessage);
        expect(resultWithUser.message).toBe(expectedMessage);
        expect(resultNoUser.success).toBe(true);
        expect(resultWithUser.success).toBe(true);
      });

      it('should record attempt before checking user existence', async () => {
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        await handler.execute(baseCommand);

        const recordAttemptOrder =
          rateLimiter.recordAttempt.mock.invocationCallOrder[0];
        const findUserOrder =
          authRepository.findByEmailAndAccountType.mock.invocationCallOrder[0];

        expect(recordAttemptOrder).toBeLessThan(findUserOrder);
      });
    });

    describe('Error handling and edge cases', () => {
      beforeEach(() => {
        rateLimiter.isRateLimited.mockReturnValue(false);
      });

      it('should handle repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        authRepository.findByEmailAndAccountType.mockRejectedValue(
          repositoryError,
        );

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should handle rate limiter errors', async () => {
        const rateLimiterError = new Error('Rate limiter service unavailable');
        rateLimiter.isRateLimited.mockImplementation(() => {
          throw rateLimiterError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          rateLimiterError,
        );
      });

      it('should handle malformed user object', async () => {
        const malformedUser = {
          get: jest.fn().mockReturnValue(null),
        };
        authRepository.findByEmailAndAccountType.mockResolvedValue(
          malformedUser as any,
        );

        await expect(handler.execute(baseCommand)).rejects.toThrow();
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete forgot password flow for existing user', async () => {
        rateLimiter.isRateLimited.mockReturnValue(false);
        mockUser.get.mockReturnValue({ getValue: () => userId });
        authRepository.findByEmailAndAccountType.mockResolvedValue(
          mockUser as any,
        );

        const result = await handler.execute(baseCommand);

        // Verify all steps were called in correct order
        expect(rateLimiter.isRateLimited).toHaveBeenCalledWith(validEmail);
        expect(authRepository.findByEmailAndAccountType).toHaveBeenCalledTimes(
          1,
        );
        expect(rateLimiter.recordAttempt).toHaveBeenCalledWith(validEmail);
        expect(authEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
          validEmail,
          userId,
          validLocale,
        );
        expect(result).toEqual({
          success: true,
          message:
            'If the email exists in our system, a password reset link has been sent.',
        });
      });

      it('should execute complete forgot password flow for non-existing user', async () => {
        rateLimiter.isRateLimited.mockReturnValue(false);
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        const result = await handler.execute(baseCommand);

        // Verify security flow
        expect(rateLimiter.isRateLimited).toHaveBeenCalledWith(validEmail);
        expect(authRepository.findByEmailAndAccountType).toHaveBeenCalledTimes(
          1,
        );
        expect(rateLimiter.recordAttempt).toHaveBeenCalledWith(validEmail);
        expect(authEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          message:
            'If the email exists in our system, a password reset link has been sent.',
        });
      });

      it('should handle different account types correctly', async () => {
        const accountTypes = [
          AccountTypeEnum.TENANT,
          AccountTypeEnum.CUSTOMER,
          AccountTypeEnum.EMPLOYEE,
        ];

        rateLimiter.isRateLimited.mockReturnValue(false);
        authRepository.findByEmailAndAccountType.mockResolvedValue(null);

        for (const accountType of accountTypes) {
          const command = new ForgotPasswordDTO(
            validEmail,
            accountType,
            validLocale,
          );

          const result = await handler.execute(command);

          expect(result.success).toBe(true);
          expect(authRepository.findByEmailAndAccountType).toHaveBeenCalledWith(
            expect.any(Object), // Email value object
            expect.any(Object), // AccountType value object
          );
        }
      });
    });
  });
});
