import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { ResponseDTO } from '../../mappers';
import { ForgotPasswordDTO } from './forgot-password.dto';
import { Email, AccountType } from '../../../aggregates/value-objects';
import { AuthEmailService } from '../../../infrastructure/emails/auth-email.service';
import { PasswordResetRateLimiter } from '../../../infrastructure/rate-limiting/password-reset-rate-limiter';

@CommandHandler(ForgotPasswordDTO)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('AuthEmailService')
    private readonly authEmailService: AuthEmailService,
    private readonly rateLimiter: PasswordResetRateLimiter,
  ) {}

  async execute(command: ForgotPasswordDTO): Promise<ResponseDTO> {
    const { email, accountType } = command;

    // Check rate limiting first
    if (this.rateLimiter.isRateLimited(email)) {
      const timeUntilReset = this.rateLimiter.getTimeUntilReset(email);
      throw new BadRequestException(
        `Too many password reset attempts. Please try again in ${timeUntilReset} minutes.`,
      );
    }

    // Create value objects for validation
    const emailVO = Email.create(email);
    const accountTypeVO = AccountType.create(accountType);

    // Check if user exists with the provided email and account type
    const existingUser = await this.authRepository.findByEmailAndAccountType(
      emailVO,
      accountTypeVO,
    );

    // Record the attempt regardless of whether user exists (for security)
    this.rateLimiter.recordAttempt(email);

    if (!existingUser) {
      // For security reasons, we don't reveal if the email exists or not
      // We return the same message regardless
      return {
        success: true,
        message:
          'If the email exists in our system, a password reset link has been sent.',
      };
    }

    // Send password reset email with user ID for token generation
    await this.authEmailService.sendPasswordResetEmail(
      email,
      existingUser.get('id').getValue(),
    );

    return {
      success: true,
      message:
        'If the email exists in our system, a password reset link has been sent.',
    };
  }
}
