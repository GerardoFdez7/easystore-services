import { Id, Months, InterestRate } from '../../value-objects';
import {
  DomainEntity,
  DomainEntityProps,
} from '@shared/aggregates/entities/domain-entity.base';
import { IInstallmentPaymentBase } from '../';

export interface IInstallmentPaymentProps extends DomainEntityProps {
  id: Id;
  months: Months;
  interestRate: InterestRate;
  variantId: Id;
}

export class InstallmentPayment extends DomainEntity<IInstallmentPaymentProps> {
  private constructor(props: IInstallmentPaymentProps) {
    super(props);
  }

  public static reconstitute(
    props: IInstallmentPaymentProps,
  ): InstallmentPayment {
    return new InstallmentPayment(props);
  }

  public static create(props: IInstallmentPaymentBase): InstallmentPayment {
    const transformedProps = {
      months: Months.create(props.months),
      interestRate: InterestRate.create(props.interestRate),
      variantId: props.variantId ? Id.create(props.variantId) : null,
    };

    const installmentPayment = new InstallmentPayment({
      id: Id.generate(),
      ...transformedProps,
    });

    return installmentPayment;
  }
}
