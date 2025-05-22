import { Variant, InstallmentPayment } from '../../entities';

export class InstallmentPaymentDeletedEvent {
  constructor(
    public readonly variant: Variant,
    public readonly deletedInstallmentPayment: InstallmentPayment,
  ) {}
}
