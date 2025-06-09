import { Id, Months, MediumDescription } from '../../value-objects';
import { IWarrantyBase, Entity, EntityProps } from '../';

export interface IWarrantyProps extends EntityProps {
  id: Id;
  months: Months;
  coverage: MediumDescription;
  instructions: MediumDescription;
  variantId: Id;
}

export class Warranty extends Entity<IWarrantyProps> {
  constructor(props: IWarrantyProps) {
    super(props);
  }

  public static create(props: IWarrantyBase): Warranty {
    const transformedProps = {
      months: Months.create(props.months),
      coverage: MediumDescription.create(props.coverage),
      instructions: MediumDescription.create(props.instructions),
      variantId: props.variantId ? Id.create(props.variantId) : null,
    };

    const warranty = new Warranty({
      id: null,
      ...transformedProps,
    });

    return warranty;
  }
}
