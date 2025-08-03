import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AccountTypeEnum } from '../../domains/authentication/aggregates/value-objects';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Sends a password reset email to the user
   * @param email - The email address to send the reset email to
   * @param accountType - The type of account (TENANT, CUSTOMER, EMPLOYEE)
   * @returns Promise that resolves when the email is sent
   */
  async sendPasswordResetEmail(
    email: string,
    accountType: AccountTypeEnum,
  ): Promise<void> {
    const resetUrl = this.buildResetPasswordUrl(email, accountType);

    const htmlContent = this.buildPasswordResetEmailHtml(resetUrl, accountType);
    const textContent = this.buildPasswordResetEmailText(resetUrl, accountType);

    try {
      await this.resend.emails.send({
        from: this.configService.get<string>(
          'RESEND_FROM_EMAIL',
          'noreply@easystore.com',
        ),
        to: [email],
        subject: 'Reset Your Password - EasyStore',
        html: htmlContent,
        text: textContent,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send password reset email: ${errorMessage}`);
    }
  }

  /**
   * Builds the password reset URL that will redirect to the frontend reset page
   * @param email - The user's email
   * @param accountType - The type of account
   * @returns The reset URL
   */
  private buildResetPasswordUrl(
    email: string,
    accountType: AccountTypeEnum,
  ): string {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const encodedEmail = encodeURIComponent(email);
    const encodedAccountType = encodeURIComponent(accountType);

    return `${frontendUrl}/reset-password?email=${encodedEmail}&accountType=${encodedAccountType}`;
  }

  /**
   * Builds the HTML content for the password reset email
   * @param resetUrl - The password reset URL
   * @param accountType - The type of account
   * @returns HTML content for the email
   */
  private buildPasswordResetEmailHtml(
    resetUrl: string,
    accountType: AccountTypeEnum,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your ${accountType.toLowerCase()} account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
              <p>This link will expire in 24 hours for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The EasyStore Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Builds the text content for the password reset email
   * @param resetUrl - The password reset URL
   * @param accountType - The type of account
   * @returns Text content for the email
   */
  private buildPasswordResetEmailText(
    resetUrl: string,
    accountType: AccountTypeEnum,
  ): string {
    return `
Reset Your Password

Hello,

We received a request to reset your password for your ${accountType.toLowerCase()} account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 24 hours for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The EasyStore Team
    `;
  }
}
