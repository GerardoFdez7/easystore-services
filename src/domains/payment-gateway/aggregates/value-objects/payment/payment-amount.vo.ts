import { ValueObject } from '../../../../shared/value-object.base';

export class PaymentAmountVO extends ValueObject<number> {
  constructor(value: number) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (this.value <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (this.value > 1000000) {
      throw new Error('Payment amount cannot exceed 1,000,000');
    }

    // Check for reasonable decimal places (max 2 for most currencies)
    const decimalPlaces = (this.value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new Error('Payment amount cannot have more than 2 decimal places');
    }
  }

  get formatted(): string {
    return this.value.toFixed(2);
  }

  add(amount: PaymentAmountVO): PaymentAmountVO {
    return new PaymentAmountVO(this.value + amount.value);
  }

  subtract(amount: PaymentAmountVO): PaymentAmountVO {
    return new PaymentAmountVO(this.value - amount.value);
  }

  multiply(factor: number): PaymentAmountVO {
    return new PaymentAmountVO(this.value * factor);
  }
}
