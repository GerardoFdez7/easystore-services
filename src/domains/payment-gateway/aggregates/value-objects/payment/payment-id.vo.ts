import { ValueObject } from '../../../../shared/value-object.base';

export class PaymentIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('Payment ID cannot be empty');
    }

    if (this.value.length < 3 || this.value.length > 100) {
      throw new Error('Payment ID must be between 3 and 100 characters');
    }
  }

  static generate(): PaymentIdVO {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return new PaymentIdVO(`pay_${timestamp}_${random}`);
  }
}
