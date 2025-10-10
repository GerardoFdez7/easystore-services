import { Injectable } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';

export interface PaymentAuditLogEntry {
  // Core transaction identifiers
  paymentId: string;
  tenantId: string;
  orderId: string;
  transactionId?: string;
  externalReferenceNumber?: string;

  // Provider information
  providerType: string;
  providerEnvironment: string; // sandbox, production, test

  // Financial details
  amount?: number;
  currency?: string;

  // Operation details
  operation:
    | 'initiate'
    | 'complete'
    | 'refund'
    | 'capture'
    | 'void'
    | 'authorize';
  operationStatus: 'success' | 'failure' | 'pending';

  // Timing information
  timestamp: string;
  processingTimeMs?: number;

  // Request/Response data (sanitized)
  requestData?: Record<string, unknown>;
  responseData?: Record<string, unknown>;

  // Error information
  errorCode?: string;
  errorMessage?: string;
  providerErrorCode?: string;
  providerErrorMessage?: string;

  // Security and compliance
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;

  // Additional metadata
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PaymentProviderLoggerService {
  private readonly logger: ReturnType<typeof createLogger>;
  private readonly auditLogger: ReturnType<typeof createLogger>;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    // Standard payment operations logger
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [
        new DailyRotateFile({
          filename: path.join(logDir, 'payment-operations-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '90d', // Keep for 90 days for compliance
          level: 'info',
        }) as TransportStream,
      ],
    });

    // Audit logger for compliance and dispute resolution
    this.auditLogger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [
        new DailyRotateFile({
          filename: path.join(logDir, 'payment-audit-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '365d', // Keep for 1 year for compliance
          level: 'info',
        }) as TransportStream,
      ],
    });

    // Add console transport for development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      );
    }
  }

  /**
   * Log payment operation for monitoring and debugging
   */
  logPaymentOperation(entry: PaymentAuditLogEntry): void {
    const logData = {
      ...entry,
      service: 'payment-gateway',
      version: '1.0',
    };

    this.logger.info('Payment operation', logData);
  }

  /**
   * Log payment operation for audit and compliance purposes
   * This creates an immutable audit trail for disputes and compliance
   */
  logPaymentAudit(entry: PaymentAuditLogEntry): void {
    const auditData = {
      ...entry,
      service: 'payment-gateway',
      auditType: 'payment-operation',
      version: '1.0',
      // Add digital signature for integrity (in production)
      // signature: this.generateSignature(entry),
    };

    this.auditLogger.info('Payment audit trail', auditData);
  }

  /**
   * Log payment initiation with comprehensive details
   */
  logPaymentInitiation(params: {
    paymentId: string;
    tenantId: string;
    orderId: string;
    providerType: string;
    providerEnvironment: string;
    amount: number;
    currency: string;
    requestData: Record<string, unknown>;
    processingTimeMs: number;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): void {
    const entry: PaymentAuditLogEntry = {
      ...params,
      operation: 'initiate',
      operationStatus: 'success',
      timestamp: new Date().toISOString(),
    };

    this.logPaymentOperation(entry);
    this.logPaymentAudit(entry);
  }

  /**
   * Log payment completion with transaction details
   */
  logPaymentCompletion(params: {
    paymentId: string;
    tenantId: string;
    orderId: string;
    transactionId: string;
    providerType: string;
    providerEnvironment: string;
    amount: number;
    currency: string;
    responseData: Record<string, unknown>;
    processingTimeMs: number;
    correlationId?: string;
  }): void {
    const entry: PaymentAuditLogEntry = {
      ...params,
      operation: 'complete',
      operationStatus: 'success',
      timestamp: new Date().toISOString(),
    };

    this.logPaymentOperation(entry);
    this.logPaymentAudit(entry);
  }

  /**
   * Log payment refund with refund details
   */
  logPaymentRefund(params: {
    paymentId: string;
    tenantId: string;
    orderId: string;
    transactionId: string;
    providerType: string;
    providerEnvironment: string;
    amount: number;
    currency: string;
    refundAmount: number;
    responseData: Record<string, unknown>;
    processingTimeMs: number;
    correlationId?: string;
  }): void {
    const entry: PaymentAuditLogEntry = {
      ...params,
      operation: 'refund',
      operationStatus: 'success',
      timestamp: new Date().toISOString(),
      metadata: {
        refundAmount: params.refundAmount,
        refundReason: 'customer_request', // Could be parameterized
      },
    };

    this.logPaymentOperation(entry);
    this.logPaymentAudit(entry);
  }

  /**
   * Log payment failure with error details
   */
  logPaymentFailure(params: {
    paymentId: string;
    tenantId: string;
    orderId: string;
    providerType: string;
    providerEnvironment: string;
    amount: number;
    currency: string;
    errorCode: string;
    errorMessage: string;
    providerErrorCode?: string;
    providerErrorMessage?: string;
    requestData?: Record<string, unknown>;
    responseData?: Record<string, unknown>;
    processingTimeMs: number;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): void {
    const entry: PaymentAuditLogEntry = {
      ...params,
      operation: 'initiate', // or 'complete', 'refund' based on context
      operationStatus: 'failure',
      timestamp: new Date().toISOString(),
    };

    this.logPaymentOperation(entry);
    this.logPaymentAudit(entry);
  }

  /**
   * Log provider-specific operations (like CyberSource capture, void, etc.)
   */
  logProviderOperation(params: {
    paymentId: string;
    tenantId: string;
    orderId: string;
    transactionId?: string;
    providerType: string;
    providerEnvironment: string;
    operation: 'capture' | 'void' | 'authorize';
    operationStatus: 'success' | 'failure';
    amount?: number;
    currency?: string;
    requestData?: Record<string, unknown>;
    responseData?: Record<string, unknown>;
    processingTimeMs: number;
    correlationId?: string;
    errorCode?: string;
    errorMessage?: string;
  }): void {
    const entry: PaymentAuditLogEntry = {
      ...params,
      timestamp: new Date().toISOString(),
    };

    this.logPaymentOperation(entry);
    this.logPaymentAudit(entry);
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = [
      'cardNumber',
      'cvv',
      'cvc',
      'securityCode',
      'password',
      'secret',
      'key',
      'token',
      'authorization',
      'merchantSecretKey',
      'clientSecret',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value as Record<string, unknown>);
      }
    }

    return sanitized;
  }

  /**
   * Generate correlation ID for request tracing
   */
  generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
