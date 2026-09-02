import { Id, Certification, RecycledPercentage } from '../../value-objects';
import {
  DomainEntity,
  DomainEntityProps,
} from '@shared/aggregates/entities/domain-entity.base';
import { ISustainabilityBase } from '..';

export interface ISustainabilityProps extends DomainEntityProps {
  id: Id;
  certification: Certification;
  recycledPercentage: RecycledPercentage;
  productId: Id;
}

export class Sustainability extends DomainEntity<ISustainabilityProps> {
  private constructor(props: ISustainabilityProps) {
    super(props);
  }

  public static reconstitute(props: ISustainabilityProps): Sustainability {
    return new Sustainability(props);
  }

  public static create(props: ISustainabilityBase): Sustainability {
    const transformedProps = {
      certification: props.certification
        ? Certification.create(props.certification)
        : null,
      recycledPercentage: RecycledPercentage.create(props.recycledPercentage),
      productId: Id.create(props.productId),
    };

    const sustainability = new Sustainability({
      id: Id.generate(),
      ...transformedProps,
    });

    return sustainability;
  }
}
