import { ValueObject } from '../../../../shared/value-object.base';
import { Id } from '../../../../shared/value-objects';

export class PaymentIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('Payment ID cannot be empty');
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.value)) {
      throw new Error('Payment ID must be a valid UUID');
    }
  }

  static generate(): PaymentIdVO {
    const id = Id.generate();
    return new PaymentIdVO(id.getValue());
  }
}
