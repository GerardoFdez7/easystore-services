import { Id, Months, InterestRate } from '../../value-objects';
import { IInstallmentPaymentBase, Entity, EntityProps } from '../';

export interface IInstallmentPaymentProps extends EntityProps {
  id: Id;
  months: Months;
  interestRate: InterestRate;
  variantId: Id;
}

export class InstallmentPayment extends Entity<IInstallmentPaymentProps> {
  constructor(props: IInstallmentPaymentProps) {
    super(props);
  }

  public static create(props: IInstallmentPaymentBase): InstallmentPayment {
    const transformedProps = {
      months: Months.create(props.months),
      interestRate: InterestRate.create(props.interestRate),
      variantId: props.variantId ? Id.create(props.variantId) : null,
    };

    const installmentPayment = new InstallmentPayment({
      id: null,
      ...transformedProps,
    });

    return installmentPayment;
  }

  public update(
    data: Partial<Omit<IInstallmentPaymentBase, 'variantId'>>,
  ): void {
    if (data.months !== undefined) {
      this.props.months = Months.create(data.months);
    }
    if (data.interestRate !== undefined) {
      this.props.interestRate = InterestRate.create(data.interestRate);
    }
  }
}
