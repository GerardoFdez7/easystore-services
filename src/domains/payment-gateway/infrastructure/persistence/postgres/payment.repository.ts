import { Injectable, Logger } from '@nestjs/common';
import { PostgreService } from '../../../../../infrastructure/database/postgres.service';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentEntity } from '../../../aggregates/entities/payment/payment.entity';
import { PaymentIdVO } from '../../../aggregates/value-objects/payment/payment-id.vo';
import {
  PaymentStatusVO,
  PaymentStatusEnum,
} from '../../../aggregates/value-objects/payment/payment-status.vo';
import { PaymentProviderTypeVO } from '../../../aggregates/value-objects/provider/payment-provider-type.vo';
import { PaymentAmountVO } from '../../../aggregates/value-objects/payment/payment-amount.vo';
import { CurrencyVO } from '../../../aggregates/value-objects/payment/currency.vo';
import { PaymentAttributes } from '../../../aggregates/entities/payment/payment.attributes';
import { Status, ProviderType, AcceptedPaymentMethod } from '.prisma/postgres';

interface PaymentRecord {
  id: string;
  amount: unknown; // Prisma Decimal type
  status: Status;
  transactionId?: string;
  orderId: string;
  paymentMethodId: string;
  subscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
  order?: {
    tenantId: string;
    tenant?: {
      id: string;
      currency: string;
    };
  };
  paymentMethod?: {
    id: string;
    metadata?: string | Record<string, unknown>;
  };
}

@Injectable()
export class PaymentPostgresRepository implements PaymentRepository {
  private readonly logger = new Logger(PaymentPostgresRepository.name);

  constructor(private readonly postgreService: PostgreService) {}

  async save(payment: PaymentEntity): Promise<void> {
    const attributes = payment.toPersistence();

    // Map our domain status to Prisma status
    const prismaStatus = this.mapStatusToPrisma(attributes.status.value);

    // Ensure payment method and subscription exist
    const paymentMethodId = await this.ensurePaymentMethodExists(attributes);
    const subscriptionId = await this.ensureSubscriptionExists(attributes);

    // Create or update payment record
    await this.postgreService.payment.upsert({
      where: { id: attributes.id.value },
      update: {
        amount: attributes.amount.value,
        status: prismaStatus,
        transactionId: attributes.transactionId,
        updatedAt: new Date(),
      },
      create: {
        id: attributes.id.value,
        amount: attributes.amount.value,
        status: prismaStatus,
        transactionId: attributes.transactionId,
        orderId: attributes.orderId,
        paymentMethodId,
        subscriptionId,
        createdAt: attributes.createdAt,
        updatedAt: attributes.updatedAt,
      },
    });

    // Store additional metadata
    if (attributes.metadata) {
      await this.updatePaymentMetadata(
        attributes.id.value,
        attributes.metadata,
      );
    }
  }

  async findById(id: PaymentIdVO): Promise<PaymentEntity | null> {
    const record = await this.postgreService.payment.findUnique({
      where: { id: id.value },
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
    });

    return record ? this.mapRecordToEntity(record) : null;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentEntity | null> {
    const record = await this.postgreService.payment.findFirst({
      where: { transactionId },
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
    });

    return record ? this.mapRecordToEntity(record) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentEntity[]> {
    const records = await this.postgreService.payment.findMany({
      where: { orderId },
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapRecordToEntity(record));
  }

  async findByTenantId(tenantId: string): Promise<PaymentEntity[]> {
    const records = await this.postgreService.payment.findMany({
      where: {
        order: {
          tenantId,
        },
      },
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapRecordToEntity(record));
  }

  async findByTenantAndStatus(
    tenantId: string,
    status: PaymentStatusVO,
  ): Promise<PaymentEntity[]> {
    const prismaStatus = this.mapStatusToPrisma(status.value);

    const records = await this.postgreService.payment.findMany({
      where: {
        status: prismaStatus,
        order: {
          tenantId,
        },
      },
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapRecordToEntity(record));
  }

  async findByTenantAndProvider(
    tenantId: string,
    _providerType: PaymentProviderTypeVO,
  ): Promise<PaymentEntity[]> {
    // This would require additional metadata or a separate table to track provider type
    // For now, we'll filter by tenant and check metadata
    const records = await this.postgreService.payment.findMany({
      where: {
        order: {
          tenantId,
        },
      },
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by provider type from metadata
    const filteredRecords = records.filter((_record) => {
      // This would need to be implemented based on how we store provider type
      return true; // Placeholder
    });

    return filteredRecords.map((record) => this.mapRecordToEntity(record));
  }

  async findPendingPayments(olderThan?: Date): Promise<PaymentEntity[]> {
    const where: Record<string, unknown> = { status: Status.PENDING };

    if (olderThan) {
      where.createdAt = { lt: olderThan };
    }

    const records = await this.postgreService.payment.findMany({
      where,
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((record) => this.mapRecordToEntity(record));
  }

  async findFailedPayments(olderThan?: Date): Promise<PaymentEntity[]> {
    const where: Record<string, unknown> = { status: Status.FAILED };

    if (olderThan) {
      where.updatedAt = { lt: olderThan };
    }

    const records = await this.postgreService.payment.findMany({
      where,
      include: {
        order: {
          include: {
            tenant: true,
          },
        },
        paymentMethod: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return records.map((record) => this.mapRecordToEntity(record));
  }

  async delete(id: PaymentIdVO): Promise<void> {
    await this.postgreService.payment.delete({
      where: { id: id.value },
    });
  }

  async exists(id: PaymentIdVO): Promise<boolean> {
    const count = await this.postgreService.payment.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.postgreService.payment.count();
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.postgreService.payment.count({
      where: {
        order: {
          tenantId,
        },
      },
    });
  }

  async countByStatus(status: PaymentStatusEnum): Promise<number> {
    const prismaStatus = this.mapStatusToPrisma(status);
    return this.postgreService.payment.count({
      where: { status: prismaStatus },
    });
  }

  // Private helper methods
  private mapRecordToEntity(record: PaymentRecord): PaymentEntity {
    // Extract metadata from payment method or create default
    const metadata = this.extractMetadataFromRecord(record);

    const attributes: PaymentAttributes = {
      id: new PaymentIdVO(record.id),
      tenantId: record.order?.tenantId || '',
      providerType: this.extractProviderTypeFromMetadata(metadata),
      amount: new PaymentAmountVO(Number(record.amount)),
      currency: this.extractCurrencyFromRecord(record),
      status: this.mapStatusFromPrisma(record.status),
      orderId: record.orderId,
      transactionId: record.transactionId,
      externalReferenceNumber: metadata.externalReferenceNumber as string,
      metadata: metadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      completedAt: this.extractCompletedAt(record),
      failedAt: this.extractFailedAt(record),
      refundedAt: this.extractRefundedAt(record),
      failureReason: metadata.failureReason as string,
    };

    return PaymentEntity.fromPersistence(attributes);
  }

  private mapStatusToPrisma(status: PaymentStatusEnum): Status {
    switch (status) {
      case PaymentStatusEnum.PENDING:
        return Status.PENDING;
      case PaymentStatusEnum.PROCESSING:
        return Status.PENDING; // Map to PENDING as PROCESSING doesn't exist in Prisma
      case PaymentStatusEnum.COMPLETED:
        return Status.COMPLETED;
      case PaymentStatusEnum.FAILED:
        return Status.FAILED;
      case PaymentStatusEnum.CANCELLED:
        return Status.CANCELLED;
      case PaymentStatusEnum.REFUNDED:
      case PaymentStatusEnum.PARTIALLY_REFUNDED:
        return Status.REFUNDED;
      default:
        return Status.PENDING;
    }
  }

  private mapStatusFromPrisma(status: Status): PaymentStatusVO {
    switch (status) {
      case Status.PENDING:
        return new PaymentStatusVO(PaymentStatusEnum.PENDING);
      case Status.COMPLETED:
        return new PaymentStatusVO(PaymentStatusEnum.COMPLETED);
      case Status.FAILED:
        return new PaymentStatusVO(PaymentStatusEnum.FAILED);
      case Status.CANCELLED:
        return new PaymentStatusVO(PaymentStatusEnum.CANCELLED);
      case Status.REFUNDED:
        return new PaymentStatusVO(PaymentStatusEnum.REFUNDED);
      default:
        return new PaymentStatusVO(PaymentStatusEnum.PENDING);
    }
  }

  private async ensurePaymentMethodExists(
    attributes: PaymentAttributes,
  ): Promise<string> {
    const paymentMethodId = `pm_${attributes.tenantId}_${attributes.providerType.value.toLowerCase()}`;

    try {
      // Try to find existing payment method
      const existing = await this.postgreService.paymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      if (existing) {
        return existing.id;
      }

      // Create new payment method if it doesn't exist
      const created = await this.postgreService.paymentMethod.create({
        data: {
          id: paymentMethodId,
          tenantId: attributes.tenantId,
          acceptedPaymentMethods: this.mapProviderTypeToAcceptedMethods(
            attributes.providerType,
          ),
        },
      });

      return created.id;
    } catch (error) {
      this.logger.warn(
        `Failed to create payment method for tenant ${attributes.tenantId}: ${(error as Error).message}`,
      );
      return `pm_${attributes.tenantId}_default`;
    }
  }

  private async ensureSubscriptionExists(
    attributes: PaymentAttributes,
  ): Promise<string> {
    const subscriptionId = `sub_${attributes.tenantId}_default`;

    try {
      // Try to find existing subscription
      const existing = await this.postgreService.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (existing) {
        return existing.id;
      }

      // Create new subscription if it doesn't exist
      const created = await this.postgreService.subscription.create({
        data: {
          id: subscriptionId,
          tenantId: attributes.tenantId,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          planId: 'default_plan', // This should be a real plan ID
        },
      });

      return created.id;
    } catch (error) {
      this.logger.warn(
        `Failed to create subscription for tenant ${attributes.tenantId}: ${(error as Error).message}`,
      );
      return subscriptionId;
    }
  }

  private mapProviderTypeToAcceptedMethods(
    providerType: PaymentProviderTypeVO,
  ): AcceptedPaymentMethod[] {
    // Map our provider types to accepted payment methods
    if (providerType.isPagadito) {
      return [
        AcceptedPaymentMethod.CREDIT_CARD,
        AcceptedPaymentMethod.DEBIT_CARD,
        AcceptedPaymentMethod.BANK_TRANSFER,
      ];
    }
    if (providerType.isVisanet) {
      return [
        AcceptedPaymentMethod.CREDIT_CARD,
        AcceptedPaymentMethod.DEBIT_CARD,
      ];
    }
    if (providerType.isPaypal) {
      return [AcceptedPaymentMethod.PAYPAL];
    }
    return [AcceptedPaymentMethod.CREDIT_CARD];
  }

  private async updatePaymentMetadata(
    paymentId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      // Get the payment to find its payment method
      const payment = await this.postgreService.payment.findUnique({
        where: { id: paymentId },
        include: { paymentMethod: true },
      });

      if (payment?.paymentMethod) {
        // Update payment method metadata
        await this.postgreService.paymentMethod.update({
          where: { id: payment.paymentMethod.id },
          data: {
            // Store metadata as JSON string in a custom field
            // Note: This would require adding a metadata field to PaymentMethod model
            // For now, we'll log it
          },
        });
      }

      // Store additional metadata in PaymentProviderCredential if needed
      if (metadata.providerType) {
        await this.ensurePaymentProviderCredentialExists(paymentId, metadata);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to update payment metadata for payment ${paymentId}: ${(error as Error).message}`,
      );
    }
  }

  private async ensurePaymentProviderCredentialExists(
    paymentId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      const payment = await this.postgreService.payment.findUnique({
        where: { id: paymentId },
        include: { order: { include: { tenant: true } } },
      });

      if (payment?.order?.tenant) {
        const providerType = metadata.providerType as string;
        const providerTypeEnum = this.mapProviderTypeToPrismaEnum(providerType);

        // Check if credentials already exist
        const existing =
          await this.postgreService.paymentProviderCredential.findUnique({
            where: {
              tenantId_provider: {
                tenantId: payment.order.tenant.id,
                provider: providerTypeEnum,
              },
            },
          });

        if (!existing) {
          // Create placeholder credentials (should be encrypted in real implementation)
          await this.postgreService.paymentProviderCredential.create({
            data: {
              tenantId: payment.order.tenant.id,
              provider: providerTypeEnum,
              credentials: JSON.stringify({
                providerType,
                paymentId,
                metadata,
              }),
            },
          });
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to create payment provider credentials for payment ${paymentId}: ${(error as Error).message}`,
      );
    }
  }

  private mapProviderTypeToPrismaEnum(providerType: string): ProviderType {
    switch (providerType.toUpperCase()) {
      case 'PAGADITO':
        return ProviderType.PAGADITO;
      case 'VISANET':
        return ProviderType.VISANET;
      case 'PAYPAL':
        return ProviderType.PAYPAL;
      default:
        return ProviderType.PAGADITO;
    }
  }

  private extractMetadataFromRecord(
    record: PaymentRecord,
  ): Record<string, unknown> {
    // Try to extract metadata from payment method or return default
    if (record.paymentMethod?.metadata) {
      try {
        return typeof record.paymentMethod.metadata === 'string'
          ? (JSON.parse(record.paymentMethod.metadata) as Record<
              string,
              unknown
            >)
          : record.paymentMethod.metadata;
      } catch (error) {
        this.logger.warn(
          `Failed to parse payment method metadata: ${(error as Error).message}`,
        );
      }
    }

    return {
      providerType: 'PAGADITO', // Default
      currency: 'USD', // Default
    };
  }

  private extractProviderTypeFromMetadata(
    metadata: Record<string, unknown>,
  ): PaymentProviderTypeVO {
    const providerType = (metadata.providerType as string) || 'PAGADITO';
    return PaymentProviderTypeVO.fromString(providerType);
  }

  private extractCurrencyFromRecord(record: PaymentRecord): CurrencyVO {
    // Try to get currency from tenant first, then from metadata
    const tenantCurrency = record.order?.tenant?.currency;
    if (tenantCurrency) {
      return CurrencyVO.fromString(tenantCurrency);
    }

    const metadata = this.extractMetadataFromRecord(record);
    const currency = (metadata.currency as string) || 'USD';
    return CurrencyVO.fromString(currency);
  }

  private extractCompletedAt(record: PaymentRecord): Date | undefined {
    if (record.status === Status.COMPLETED) {
      // Try to get from metadata first, then use updatedAt
      const metadata = this.extractMetadataFromRecord(record);
      if (metadata.completedAt) {
        return new Date(metadata.completedAt as string);
      }
      return record.updatedAt;
    }
    return undefined;
  }

  private extractFailedAt(record: PaymentRecord): Date | undefined {
    if (record.status === Status.FAILED) {
      // Try to get from metadata first, then use updatedAt
      const metadata = this.extractMetadataFromRecord(record);
      if (metadata.failedAt) {
        return new Date(metadata.failedAt as string);
      }
      return record.updatedAt;
    }
    return undefined;
  }

  private extractRefundedAt(record: PaymentRecord): Date | undefined {
    if (record.status === Status.REFUNDED) {
      // Try to get from metadata first, then use updatedAt
      const metadata = this.extractMetadataFromRecord(record);
      if (metadata.refundedAt) {
        return new Date(metadata.refundedAt as string);
      }
      return record.updatedAt;
    }
    return undefined;
  }
}
