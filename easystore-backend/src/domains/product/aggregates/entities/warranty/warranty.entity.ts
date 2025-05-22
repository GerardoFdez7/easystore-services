import { Entity, EntityProps } from '@domains/entity.base';
import { Id, Months, MediumDescription } from '../../value-objects';
import { IWarrantyBase } from '../';

export interface WarrantyProps extends EntityProps {
  id: Id;
  months: Months;
  coverage: MediumDescription;
  instructions: MediumDescription;
  variantId: Id;
  updatedAt: Date;
  createdAt: Date;
}

export class Warranty extends Entity<WarrantyProps> {
  constructor(props: WarrantyProps) {
    super(props);
  }

  public static create(props: IWarrantyBase): Warranty {
    const transformedProps = {
      months: Months.create(props.months),
      coverage: MediumDescription.create(props.coverage),
      instructions: MediumDescription.create(props.instructions),
      variantId: Id.create(props.variantId),
    };

    const warranty = new Warranty({
      id: null,
      ...transformedProps,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return warranty;
  }

  public update(data: Partial<Omit<IWarrantyBase, 'variantId'>>): void {
    if (data.months !== undefined) {
      this.props.months = Months.create(data.months);
    }
    if (data.coverage !== undefined) {
      this.props.coverage = MediumDescription.create(data.coverage);
    }
    if (data.instructions !== undefined) {
      this.props.instructions = MediumDescription.create(data.instructions);
    }
    this.props.updatedAt = new Date();
  }
}
