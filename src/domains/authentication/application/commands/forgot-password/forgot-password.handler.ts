import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { ForgotPasswordDTO } from './forgot-password.dto';
import { Email, AccountType } from '../../../aggregates/value-objects';
import { AuthEmailService } from '../../../infrastructure/emails/auth-email.service';

@CommandHandler(ForgotPasswordDTO)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('AuthEmailService')
    private readonly authEmailService: AuthEmailService,
  ) {}

  async execute(command: ForgotPasswordDTO): Promise<{ message: string }> {
    const { email, accountType } = command.data;

    // Create value objects for validation
    const emailVO = Email.create(email);
    const accountTypeVO = AccountType.create(accountType);

    // Check if user exists with the provided email and account type
    const existingUser = await this.authRepository.findByEmailAndAccountType(
      emailVO,
      accountTypeVO,
    );

    if (!existingUser) {
      // For security reasons, we don't reveal if the email exists or not
      // We return the same message regardless
      return {
        message:
          'If the email exists in our system, a password reset link has been sent.',
      };
    }

    // Send password reset email
    await this.authEmailService.sendPasswordResetEmail(email);

    return {
      message:
        'If the email exists in our system, a password reset link has been sent.',
    };
  }
}
