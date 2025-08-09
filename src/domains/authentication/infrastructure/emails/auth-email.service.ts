import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@email/index';
import {
  ForgotPasswordEmailBuilder,
  ForgotPasswordEmailData,
} from './forgot-password/forgot-password-email.builder';

export enum AuthEmailType {
  FORGOT_PASSWORD = 'forgot_password',
}

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
   * Sends a password reset email
   * @param email - The email address to send the reset email to
   * @returns Promise that resolves when the email is sent
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const resetUrl = this.buildResetPasswordUrl(email);

    const emailData: ForgotPasswordEmailData = {
      recipientEmail: email,
      resetUrl,
    };

    await this.sendEmail({
      to: email,
      subject: this.forgotPasswordEmailBuilder.getSubject(emailData),
      html: this.forgotPasswordEmailBuilder.buildHtml(emailData),
      text: this.forgotPasswordEmailBuilder.buildText(emailData),
    });
  }

  /**
   * Builds the password reset URL
   * @param email - The user's email address
   * @returns The reset URL
   */
  private buildResetPasswordUrl(email: string): string {
    const encodedEmail = encodeURIComponent(email);
    return `${this.frontendUrl}/reset-password?email=${encodedEmail}`;
  }
}
