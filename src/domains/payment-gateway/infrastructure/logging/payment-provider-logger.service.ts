import { Injectable } from '@nestjs/common';
import * as pino from 'pino';
import * as path from 'path';
import * as fs from 'fs';

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
  private readonly logger: pino.Logger;
  private readonly auditLogger: pino.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create date-based filename
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const operationsLogFile = path.join(
      logDir,
      `payment-operations-${today}.log`,
    );
    const auditLogFile = path.join(logDir, `payment-audit-${today}.log`);

    // Standard payment operations logger
    this.logger = pino.pino(
      {
        level: 'info',
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      },
      pino.destination({
        dest: operationsLogFile,
        mkdir: true,
        sync: false,
      }),
    );

    // Audit logger for compliance and dispute resolution
    this.auditLogger = pino.pino(
      {
        level: 'info',
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      },
      pino.destination({
        dest: auditLogFile,
        mkdir: true,
        sync: false,
      }),
    );
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

    this.logger.info(logData, 'Payment operation');
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

    this.auditLogger.info(auditData, 'Payment audit trail');
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
