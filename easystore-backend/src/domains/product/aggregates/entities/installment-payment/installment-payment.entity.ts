import { Entity, EntityProps } from '@domains/entity.base';
import { Id, Months, InterestRate } from '../../value-objects';
import { IInstallmentPaymentBase } from '../';

export interface InstallmentPaymentProps extends EntityProps {
  id: Id;
  months: Months;
  interestRate: InterestRate;
  variantId: Id;
  updatedAt: Date;
  createdAt: Date;
}

export class InstallmentPayment extends Entity<InstallmentPaymentProps> {
  constructor(props: InstallmentPaymentProps) {
    super(props);
  }

  public static create(props: IInstallmentPaymentBase): InstallmentPayment {
    const transformedProps = {
      months: Months.create(props.months),
      interestRate: InterestRate.create(props.interestRate),
      variantId: Id.create(props.variantId),
    };

    const installmentPayment = new InstallmentPayment({
      id: null,
      ...transformedProps,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    this.props.updatedAt = new Date();
  }
}
