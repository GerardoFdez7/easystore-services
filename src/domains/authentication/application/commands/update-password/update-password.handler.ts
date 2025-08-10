import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { UpdatePasswordDTO } from './update-password.dto';
import { Id } from '../../../aggregates/value-objects';
import { AuthenticationMapper, ResponseDTO } from '../../mappers';
import {
  verifyPasswordResetToken,
  invalidateToken,
} from '../../../infrastructure/jwt';
import { PasswordResetRateLimiter } from '../../../infrastructure/rate-limiting/password-reset-rate-limiter';

@CommandHandler(UpdatePasswordDTO)
export class UpdatePasswordHandler
  implements ICommandHandler<UpdatePasswordDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly rateLimiter: PasswordResetRateLimiter,
  ) {}

  async execute(command: UpdatePasswordDTO): Promise<ResponseDTO> {
    const { token, password } = command;

    try {
      // Verify the password reset token
      const tokenPayload = verifyPasswordResetToken(token);
      const { email, authIdentityId } = tokenPayload;

      // Find the user by ID to ensure they still exist
      const userIdVO = Id.create(authIdentityId);
      const existingUser = await this.authRepository.findById(userIdVO);

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Verify the email matches (additional security check)
      if (existingUser.get('email').getValue() !== email) {
        throw new BadRequestException('Invalid reset token');
      }

      // Update the user's password using the domain method
      const updatedUser = this.eventPublisher.mergeObjectContext(
        AuthenticationMapper.fromUpdateDto(existingUser, password),
      );

      // Update in repository
      await this.authRepository.update(existingUser.get('id'), updatedUser);

      // Invalidate the used token to prevent reuse
      invalidateToken(token);

      // Clear rate limiting attempts for this email (successful reset)
      this.rateLimiter.clearAttempts(email);

      // Commit events
      updatedUser.commit();

      return {
        success: true,
        message:
          'Password updated successfully. All reset tokens have been invalidated.',
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'JsonWebTokenError' ||
          error.message === 'TokenExpiredError')
      ) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw error;
    }
  }
}
