/**
 * Base interface for domain-specific email services
 * Each domain should implement this interface to provide
 * their specific email functionality
 */
export interface IEmailService {
  /**
   * Validates email configuration and dependencies
   * @returns Promise that resolves if validation passes
   */
  validateConfiguration?(): Promise<void>;
}

/**
 * Template interface for email builders
 * Domains can use this to create consistent email builders
 */
export interface IEmailBuilder<TData = unknown> {
  /**
   * Builds the HTML content for the email
   * @param data - Data needed to build the email
   * @returns HTML string
   */
  buildHtml(data: TData): string;

  /**
   * Builds the plain text content for the email
   * @param data - Data needed to build the email
   * @returns Plain text string
   */
  buildText(data: TData): string;

  /**
   * Gets the email subject
   * @param data - Data needed to build the subject
   * @param locale - Locale to use for translation
   * @returns Email subject string
   */
  getSubject(data: TData, locale: string): string;
}

/**
 * Email template data interface
 * Common structure for email template data
 */
export interface IEmailTemplateData {
  recipientEmail: string;
  recipientName?: string;
  [key: string]: unknown;
}
