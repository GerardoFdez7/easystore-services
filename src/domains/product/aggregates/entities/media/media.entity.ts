import { Id, Media as MediaVO, Position, MediaType } from '../../value-objects';
import {
  DomainEntity,
  DomainEntityProps,
} from '@shared/aggregates/entities/domain-entity.base';
import { IMediaBase } from '../';

export interface IMediaProps extends DomainEntityProps {
  id: Id;
  url: MediaVO;
  position: Position;
  mediaType: MediaType;
  productId?: Id;
  variantId?: Id;
  tenantId: Id;
}

export class Media extends DomainEntity<IMediaProps> {
  private constructor(props: IMediaProps) {
    super(props);
  }

  public static reconstitute(props: IMediaProps): Media {
    return new Media(props);
  }

  public static create(props: IMediaBase): Media {
    const transformedProps = {
      url: MediaVO.create(props.url),
      position: Position.create(props.position),
      mediaType: MediaType.create(props.mediaType),
      productId: props.productId ? Id.create(props.productId) : null,
      variantId: props.variantId ? Id.create(props.variantId) : null,
      tenantId: Id.create(props.tenantId),
    };

    const media = new Media({
      id: Id.generate(),
      ...transformedProps,
    });

    return media;
  }

  public update(
    data: Partial<Omit<IMediaBase, 'productId' | 'variantId' | 'tenantId'>>,
  ): void {
    if (data.url !== undefined) {
      this.props.url = MediaVO.create(data.url);
    }
    if (data.position !== undefined) {
      this.props.position = Position.create(data.position);
    }
    if (data.mediaType !== undefined) {
      this.props.mediaType = MediaType.create(data.mediaType);
    }
  }
}
