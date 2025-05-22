import { Variant, InstallmentPayment } from '../../entities';

export class InstallmentPaymentCreatedEvent {
  constructor(
    public readonly variant: Variant,
    public readonly installmentPaymentCreated: InstallmentPayment,
  ) {}
}
