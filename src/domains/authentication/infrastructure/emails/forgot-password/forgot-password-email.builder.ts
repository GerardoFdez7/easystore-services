import { Injectable } from '@nestjs/common';
import { IEmailBuilder, IEmailTemplateData } from '@email/index';

export interface ForgotPasswordEmailData extends IEmailTemplateData {
  resetUrl: string;
}

/**
 * Email builder for forgot password emails
 * Handles the construction of HTML and text content for password reset emails
 */
@Injectable()
export class ForgotPasswordEmailBuilder
  implements IEmailBuilder<ForgotPasswordEmailData>
{
  /**
   * Builds the HTML content for the password reset email
   * @param data - The email template data
   * @returns HTML content for the email
   */
  buildHtml(data: ForgotPasswordEmailData): string {
    const { resetUrl, recipientName } = data;
    const displayName = recipientName || 'User';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px; 
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content { 
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #2c3e50;
            }
            .message {
              font-size: 16px;
              margin-bottom: 30px;
              color: #555;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: transform 0.2s ease;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .footer { 
              background-color: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              font-size: 14px; 
              color: #6c757d;
              border-top: 1px solid #e9ecef;
            }
            .security-note {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
              color: #856404;
            }
            .link-fallback {
              word-break: break-all;
              background-color: #f8f9fa;
              padding: 10px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 12px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello ${displayName},</div>
              <div class="message">
                We received a request to reset your password for your EasyStore account. 
                Click the button below to create a new password:
              </div>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="security-note">
                <strong>Security Notice:</strong> This link will expire in 24 hours for your security. 
                If you didn't request this password reset, please ignore this email.
              </div>
              <div class="message">
                If the button doesn't work, you can copy and paste this link into your browser:
              </div>
              <div class="link-fallback">
                ${resetUrl}
              </div>
            </div>
            <div class="footer">
              <p>This email was sent by EasyStore. If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} EasyStore. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Builds the plain text content for the password reset email
   * @param data - The email template data
   * @returns Plain text content for the email
   */
  buildText(data: ForgotPasswordEmailData): string {
    const { resetUrl, recipientName } = data;
    const displayName = recipientName || 'User';

    return `
Hello ${displayName},

We received a request to reset your password for your EasyStore account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 24 hours for your security.

If you didn't request this password reset, please ignore this email.

If you have any questions, please contact our support team.

Best regards,
The EasyStore Team

© ${new Date().getFullYear()} EasyStore. All rights reserved.
    `;
  }

  /**
   * Gets the email subject
   * @param data - The email template data
   * @returns Email subject string
   */
  getSubject(_data: ForgotPasswordEmailData): string {
    return 'Reset Your Password - EasyStore';
  }
}
