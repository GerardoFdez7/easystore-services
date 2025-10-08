import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentStatusVO } from '../../../aggregates/value-objects/payment/payment-status.vo';
import { PaymentProviderTypeVO } from '../../../aggregates/value-objects/provider/payment-provider-type.vo';
import { ListPaymentsDto } from './list-payments.dto';
import { PaymentEntity } from '../../../aggregates/entities/payment/payment.entity';

export interface ListPaymentsResult {
  payments: PaymentEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ListPaymentsHandler {
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async handle(dto: ListPaymentsDto): Promise<ListPaymentsResult> {
    let payments: PaymentEntity[];

    if (dto.orderId) {
      payments = await this.paymentRepository.findByOrderId(dto.orderId);
      // Filter by tenant for security
      payments = payments.filter(
        (payment) => payment.tenantId === dto.tenantId,
      );
    } else if (dto.status) {
      const status = new PaymentStatusVO(dto.status);
      payments = await this.paymentRepository.findByTenantAndStatus(
        dto.tenantId,
        status,
      );
    } else if (dto.providerType) {
      const providerType = PaymentProviderTypeVO.fromString(dto.providerType);
      payments = await this.paymentRepository.findByTenantAndProvider(
        dto.tenantId,
        providerType,
      );
    } else {
      payments = await this.paymentRepository.findByTenantId(dto.tenantId);
    }

    // Apply pagination
    const total = payments.length;
    const startIndex = (dto.page - 1) * dto.limit;
    const endIndex = startIndex + dto.limit;
    const paginatedPayments = payments.slice(startIndex, endIndex);

    return {
      payments: paginatedPayments,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }
}
