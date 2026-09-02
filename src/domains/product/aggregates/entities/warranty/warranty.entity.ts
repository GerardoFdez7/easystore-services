import { Id, Months, MediumDescription } from '../../value-objects';
import {
  DomainEntity,
  DomainEntityProps,
} from '@shared/aggregates/entities/domain-entity.base';
import { IWarrantyBase } from '../';

export interface IWarrantyProps extends DomainEntityProps {
  id: Id;
  months: Months;
  coverage: MediumDescription;
  instructions: MediumDescription;
  variantId: Id;
}

export class Warranty extends DomainEntity<IWarrantyProps> {
  private constructor(props: IWarrantyProps) {
    super(props);
  }

  public static reconstitute(props: IWarrantyProps): Warranty {
    return new Warranty(props);
  }

  public static create(props: IWarrantyBase): Warranty {
    const transformedProps = {
      months: Months.create(props.months),
      coverage: MediumDescription.create(props.coverage),
      instructions: MediumDescription.create(props.instructions),
      variantId: props.variantId ? Id.create(props.variantId) : null,
    };

    const warranty = new Warranty({
      id: Id.generate(),
      ...transformedProps,
    });

    return warranty;
  }
}
