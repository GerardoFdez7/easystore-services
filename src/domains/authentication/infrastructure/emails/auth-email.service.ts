import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@email/index';
import {
  ForgotPasswordEmailBuilder,
  ForgotPasswordEmailData,
} from './forgot-password/forgot-password-email.builder';
import {
  GetInTouchEmailBuilder,
  GetInTouchEmailData,
} from './get-in-touch/get-in-touch.builder';
import { generatePasswordResetToken } from '../jwt';
import { GetInTouchDTO } from '@authentication/application/commands/get-in.touch/get-in-touch.dto';

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
    private readonly getInTouchEmailBuilder: GetInTouchEmailBuilder,
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
   * @param locale - The user's preferred language (en, es, fr, it, pt)
   * @returns Promise that resolves when the email is sent
   */
  async sendPasswordResetEmail(
    email: string,
    userId: string,
    locale: string,
  ): Promise<void> {
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
      locale,
    };

    await this.sendEmail({
      to: email,
      subject: this.forgotPasswordEmailBuilder.getSubject(emailData, locale),
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
    return `${this.frontendUrl}/login?token=${encodeURIComponent(token)}`;
  }

  async sendGetInTouchEmail(data: GetInTouchDTO): Promise<void> {
    // Define the recipient emails
    const recipientEmails = ['rui23719@uvg.edu.gt', 'josegrg04@gmail.com'];

    // Prepare email data
    const emailData: GetInTouchEmailData = {
      recipientEmail: recipientEmails[0], // Use first recipient as primary
      fullName: data.fullName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      company: data.company,
      websiteUrl: data.websiteUrl,
      country: data.country,
      annualRevenue: data.annualRevenue,
      isAgency: data.isAgency,
    };

    // Send email to all recipients
    await this.sendEmail({
      to: recipientEmails,
      subject: this.getInTouchEmailBuilder.getSubject(emailData),
      html: this.getInTouchEmailBuilder.buildHtml(emailData),
      text: this.getInTouchEmailBuilder.buildText(emailData),
    });
  }

  async sendGetInTouchEmail(data: GetInTouchDTO): Promise<void> {
    // Define the recipient emails
    const recipientEmails = ['rui23719@uvg.edu.gt', 'josegrg04@gmail.com'];

    // Prepare email data
    const emailData: GetInTouchEmailData = {
      recipientEmail: recipientEmails[0], // Use first recipient as primary
      fullName: data.fullName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      company: data.company,
      websiteUrl: data.websiteUrl,
      country: data.country,
      annualRevenue: data.annualRevenue,
      isAgency: data.isAgency,
      locale: 'en', // Default to English
    };

    // Send email to all recipients
    await this.sendEmail({
      to: recipientEmails,
      subject: this.getInTouchEmailBuilder.getSubject(
        emailData,
        emailData.locale,
      ),
      html: this.getInTouchEmailBuilder.buildHtml(emailData),
      text: this.getInTouchEmailBuilder.buildText(emailData),
    });
  }
}
