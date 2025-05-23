import { Id, Certification, RecycledPercentage } from '../../value-objects';
import { ISustainabilityBase, Entity, EntityProps } from '..';

export interface ISustainabilityProps extends EntityProps {
  id: Id;
  certification: Certification;
  recycledPercentage: RecycledPercentage;
  productId: Id;
}

export class Sustainability extends Entity<ISustainabilityProps> {
  constructor(props: ISustainabilityProps) {
    super(props);
  }

  public static create(props: ISustainabilityBase): Sustainability {
    const transformedProps = {
      certification: props.certification
        ? Certification.create(props.certification)
        : null,
      recycledPercentage:
        props.recycledPercentage !== null &&
        props.recycledPercentage !== undefined
          ? RecycledPercentage.create(props.recycledPercentage)
          : null,
      productId: Id.create(props.productId),
    };

    const sustainability = new Sustainability({
      id: null,
      ...transformedProps,
    });

    return sustainability;
  }

  public update(data: Partial<Omit<ISustainabilityBase, 'productId'>>): void {
    if (data.certification !== undefined) {
      this.props.certification = data.certification
        ? Certification.create(data.certification)
        : null;
    }
    if (data.recycledPercentage !== undefined) {
      this.props.recycledPercentage =
        data.recycledPercentage !== null &&
        data.recycledPercentage !== undefined
          ? RecycledPercentage.create(data.recycledPercentage)
          : null;
    }
  }
}
