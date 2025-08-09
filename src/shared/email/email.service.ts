import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Base email service providing core email infrastructure
 * This service handles the low-level email sending functionality
 * and should be extended by domain-specific email services
 */
@Injectable()
export class EmailService {
  protected readonly resend: Resend;
  protected readonly defaultFromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    this.resend = new Resend(apiKey);
    this.defaultFromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'onboarding@resend.dev';
  }

  /**
   * Sends an email using the configured email provider
   * @param options - Email configuration options
   * @returns Promise that resolves when the email is sent
   */
  protected async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.resend.emails.send({
        from: options.from || this.defaultFromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Gets the default from email address
   * @returns The configured default from email
   */
  protected getDefaultFromEmail(): string {
    return this.defaultFromEmail;
  }

  /**
   * Gets a configuration value
   * @param key - Configuration key
   * @param defaultValue - Default value if key is not found
   * @returns Configuration value
   */
  protected getConfig<T = string>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue);
  }
}
