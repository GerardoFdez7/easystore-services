import { Injectable } from '@nestjs/common';
import { IEmailBuilder, IEmailTemplateData } from '@email/index';
import { translations, TranslationKeys, SupportedLocale } from './languages';

export interface GetInTouchEmailData extends IEmailTemplateData {
  recipientEmail: string;
  fullName: string;
  businessEmail: string;
  businessPhone: string;
  company: string;
  websiteUrl: string;
  country: string;
  annualRevenue: string;
  isAgency: string;
  locale: string;
}

/**
 * Email builder for get in touch emails
 * Handles the construction of HTML and text content for contact form emails
 * Supports internationalization for multiple languages
 */
@Injectable()
export class GetInTouchEmailBuilder
  implements IEmailBuilder<GetInTouchEmailData>
{
  private getTranslation(locale: string): TranslationKeys {
    const supportedLocale = locale as SupportedLocale;
    return translations[supportedLocale] || translations.en;
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
   * Builds the HTML content for the get in touch email
   * @param data - The email template data
   * @returns HTML content for the email
   */
  buildHtml(data: GetInTouchEmailData): string {
    const {
      fullName,
      businessEmail,
      businessPhone,
      company,
      websiteUrl,
      country,
      annualRevenue,
      isAgency,
      locale,
    } = data;

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
    <title>New Business Contact Form Submission</title>
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
      .contact-details {
        background-color: #f8f9fa;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }
      .contact-details h3 {
        margin-top: 0;
        color: #2c3e50;
        font-size: 18px;
      }
      .contact-field {
        margin-bottom: 10px;
      }
      .contact-field strong {
        color: #495057;
        display: inline-block;
        width: 120px;
      }
      .business-details {
        background-color: #e7f3ff;
        border-left: 4px solid #007bff;
        padding: 20px;
        margin: 20px 0;
        border-radius: 0 6px 6px 0;
      }
      .business-details h3 {
        margin-top: 0;
        color: #2c3e50;
        font-size: 18px;
      }
      .footer {
        background-color: #f8f9fa;
        padding: 30px;
        text-align: center;
        font-size: 14px;
        color: #6c757d;
        border-top: 1px solid #e9ecef;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${t.subject}</h1>
      </div>
      <div class="content">
        <div class="greeting">${t.greeting},</div>
        <div class="message">
          ${t.newContactMessage}
        </div>
        
        <div class="contact-details">
          <h3>${t.contactDetails}</h3>
          <div class="contact-field">
            <strong>Full Name:</strong> ${fullName}
          </div>
          <div class="contact-field">
            <strong>Business Email:</strong> ${businessEmail}
          </div>
          <div class="contact-field">
            <strong>Business Phone:</strong> ${businessPhone}
          </div>
        </div>

        <div class="business-details">
          <h3>${t.businessDetails}</h3>
          <div class="contact-field">
            <strong>Company:</strong> ${company}
          </div>
          <div class="contact-field">
            <strong>Website URL:</strong> ${websiteUrl}
          </div>
          <div class="contact-field">
            <strong>Country:</strong> ${country}
          </div>
          <div class="contact-field">
            <strong>Annual Revenue:</strong> ${annualRevenue}
          </div>
          <div class="contact-field">
            <strong>Is Agency:</strong> ${isAgency}
          </div>
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
   * Builds the plain text content for the get in touch email
   * @param data - The email template data
   * @returns Plain text content for the email
   */
  buildText(data: GetInTouchEmailData): string {
    const {
      fullName,
      businessEmail,
      businessPhone,
      company,
      websiteUrl,
      country,
      annualRevenue,
      isAgency,
      locale,
    } = data;

    if (!locale) {
      throw new Error('Locale is required for email generation');
    }
    const t = this.getTranslation(locale);
    const currentYear = new Date().getFullYear();

    return `
${t.greeting},

${t.newContactMessage}

${t.contactDetails}:
- Full Name: ${fullName}
- Business Email: ${businessEmail}
- Business Phone: ${businessPhone}

${t.businessDetails}:
- Company: ${company}
- Website URL: ${websiteUrl}
- Country: ${country}
- Annual Revenue: ${annualRevenue}
- Is Agency: ${isAgency}

${t.footerText}

${this.formatMessage(t.copyright, { year: currentYear })}
    `;
  }

  /**
   * Gets the email subject
   * @param data - The email template data
   * @param locale - The user's preferred language
   * @returns Email subject string
   */
  getSubject(data: GetInTouchEmailData, locale: string): string {
    if (!locale) {
      throw new Error('Locale is required for email generation');
    }
    const t = this.getTranslation(locale);
    return t.subject;
  }
}
