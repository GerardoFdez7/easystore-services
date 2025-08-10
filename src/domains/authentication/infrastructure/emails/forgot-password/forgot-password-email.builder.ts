import { Injectable } from '@nestjs/common';
import { IEmailBuilder, IEmailTemplateData } from '@email/index';
import { translations, SupportedLocale } from './languages';

export interface ForgotPasswordEmailData extends IEmailTemplateData {
  resetUrl: string;
  expirationMinutes?: number;
  securityNotice?: string;
  locale: string;
}

/**
 * Email builder for forgot password emails
 * Handles the construction of HTML and text content for password reset emails
 * Supports internationalization for multiple languages
 */
@Injectable()
export class ForgotPasswordEmailBuilder
  implements IEmailBuilder<ForgotPasswordEmailData>
{
  private getTranslation(locale: string): typeof translations.en {
    return translations[locale as SupportedLocale] || translations.en;
  }

  private formatMessage(
    message: string,
    replacements: Record<string, string | number>,
  ): string {
    return Object.entries(replacements).reduce(
      (text, [key, value]) =>
        text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
      message,
    );
  }
  /**
   * Builds the HTML content for the password reset email
   * @param data - The email template data
   * @returns HTML content for the email
   */
  buildHtml(data: ForgotPasswordEmailData): string {
    const { resetUrl, expirationMinutes = 15, locale } = data;

    if (!locale) {
      throw new Error('Locale is required for email generation');
    }
    const t = this.getTranslation(locale);
    const currentYear = new Date().getFullYear();

    return `
      <!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Reset Your Password</title>
    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, sans-serif;
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
        background: linear-gradient(135deg, #bc5bf5 50%, #6304c3 100%);
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
        background: linear-gradient(135deg, #bc5bf5 25%, #6304c3 100%);
        color: white !important;
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
        <h1>${t.title}</h1>
      </div>
      <div class="content">
        <div class="greeting">${t.greeting},</div>
        <div class="message">
          ${t.message}
        </div>
        <div style="text-align: center">
          <a href="${resetUrl}" class="button">${t.buttonText}</a>
        </div>
        <div
          class="security-note"
          style="
            background-color: #e7f3ff;
            border-color: #b3d9ff;
            color: #004085;
            margin-top: 10px;
          "
        >
          <strong>${t.securityTitle}</strong> ${this.formatMessage(t.securityMessage, { minutes: expirationMinutes })}
        </div>
      </div>
      <div class="footer">
        <p>
          ${t.footerText}
        </p>
        <p>${this.formatMessage(t.copyright, { year: currentYear })}</p>
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
    const { resetUrl, expirationMinutes = 15, locale } = data;

    if (!locale) {
      throw new Error('Locale is required for email generation');
    }
    const t = this.getTranslation(locale);
    const currentYear = new Date().getFullYear();

    return `
${t.greeting},

${t.textMessage}

${t.textInstructions}
${resetUrl}

${this.formatMessage(t.textSecurity, { minutes: expirationMinutes })}

${t.textIgnore}

${t.textSupport}

${t.textSignature}

${this.formatMessage(t.copyright, { year: currentYear })}
    `;
  }

  /**
   * Gets the email subject
   * @param data - The email template data
   * @param locale - The user's preferred language
   * @returns Email subject string
   */
  getSubject(data: ForgotPasswordEmailData, locale: string): string {
    if (!locale) {
      throw new Error('Locale is required for email generation');
    }
    const t = this.getTranslation(locale);
    return t.subject;
  }
}
