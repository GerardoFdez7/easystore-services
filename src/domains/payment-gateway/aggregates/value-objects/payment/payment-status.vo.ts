import { ValueObject } from '../../../../shared/value-object.base';

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export class PaymentStatusVO extends ValueObject<PaymentStatusEnum> {
  constructor(value: PaymentStatusEnum) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!Object.values(PaymentStatusEnum).includes(this.value)) {
      throw new Error(`Invalid payment status: ${this.value}`);
    }
  }

  static fromString(status: string): PaymentStatusVO {
    const normalizedStatus = status.toUpperCase() as PaymentStatusEnum;
    return new PaymentStatusVO(normalizedStatus);
  }

  get isPending(): boolean {
    return this.value === PaymentStatusEnum.PENDING;
  }

  get isProcessing(): boolean {
    return this.value === PaymentStatusEnum.PROCESSING;
  }

  get isCompleted(): boolean {
    return this.value === PaymentStatusEnum.COMPLETED;
  }

  get isFailed(): boolean {
    return this.value === PaymentStatusEnum.FAILED;
  }

  get isCancelled(): boolean {
    return this.value === PaymentStatusEnum.CANCELLED;
  }

  get isRefunded(): boolean {
    return (
      this.value === PaymentStatusEnum.REFUNDED ||
      this.value === PaymentStatusEnum.PARTIALLY_REFUNDED
    );
  }

  get canBeRefunded(): boolean {
    return this.isCompleted;
  }

  get canBeCancelled(): boolean {
    return this.isPending || this.isProcessing;
  }

  get canTransitionTo(): PaymentStatusEnum[] {
    switch (this.value) {
      case PaymentStatusEnum.PENDING:
        return [PaymentStatusEnum.PROCESSING, PaymentStatusEnum.CANCELLED];
      case PaymentStatusEnum.PROCESSING:
        return [
          PaymentStatusEnum.COMPLETED,
          PaymentStatusEnum.FAILED,
          PaymentStatusEnum.CANCELLED,
        ];
      case PaymentStatusEnum.COMPLETED:
        return [
          PaymentStatusEnum.REFUNDED,
          PaymentStatusEnum.PARTIALLY_REFUNDED,
        ];
      case PaymentStatusEnum.FAILED:
      case PaymentStatusEnum.CANCELLED:
      case PaymentStatusEnum.REFUNDED:
        return [];
      case PaymentStatusEnum.PARTIALLY_REFUNDED:
        return [PaymentStatusEnum.REFUNDED];
      default:
        return [];
    }
  }

  canTransitionToStatus(newStatus: PaymentStatusEnum): boolean {
    return this.canTransitionTo.includes(newStatus);
  }
}
