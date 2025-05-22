import { Variant, InstallmentPayment } from '../../entities';

export class InstallmentPaymentUpdatedEvent {
  constructor(
    public readonly variant: Variant,
    public readonly updatedInstallmentPayment: InstallmentPayment,
  ) {}
}
