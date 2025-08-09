import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@email/index';
import {
  ForgotPasswordEmailBuilder,
  ForgotPasswordEmailData,
} from './forgot-password/forgot-password-email.builder';
import { generatePasswordResetToken } from '../jwt';

/**
 * Comprehensive email service for authentication domain
 * Handles all authentication-related email communications
 */
@Injectable()
export class AuthEmailService extends EmailService {
  private readonly frontendUrl: string;

  constructor(
    configService: ConfigService,
    private readonly forgotPasswordEmailBuilder: ForgotPasswordEmailBuilder,
  ) {
    super(configService);
    this.frontendUrl = this.getConfig<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  /**
   * Sends a password reset email with secure token
   * @param email - The email address to send the reset email to
   * @param userId - The user's ID for token generation
   * @returns Promise that resolves when the email is sent
   */
  async sendPasswordResetEmail(email: string, userId: string): Promise<void> {
    // Generate secure reset token with 15-minute expiration
    const resetToken = generatePasswordResetToken({
      email,
      authIdentityId: userId,
    });

    const resetUrl = this.buildResetPasswordUrl(resetToken);

    const emailData: ForgotPasswordEmailData = {
      recipientEmail: email,
      resetUrl,
      expirationMinutes: 15,
      securityNotice:
        'This secure link will expire in 15 minutes for your protection.',
    };

    await this.sendEmail({
      to: email,
      subject: this.forgotPasswordEmailBuilder.getSubject(emailData),
      html: this.forgotPasswordEmailBuilder.buildHtml(emailData),
      text: this.forgotPasswordEmailBuilder.buildText(emailData),
    });
  }

  /**
   * Builds the password reset URL with secure token
   * @param token - The secure reset token
   * @returns The reset URL
   */
  private buildResetPasswordUrl(token: string): string {
    return `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }
}
