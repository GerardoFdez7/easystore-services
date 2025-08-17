import { Id, Media as MediaVO, Position, MediaType } from '../../value-objects';
import { IMediaBase, Entity, EntityProps } from '../';

export interface IMediaProps extends EntityProps {
  id: Id;
  url: MediaVO;
  position: Position;
  mediaType: MediaType;
  productId?: Id;
  variantId?: Id;
}

export class Media extends Entity<IMediaProps> {
  constructor(props: IMediaProps) {
    super(props);
  }

  public static create(props: IMediaBase): Media {
    const transformedProps = {
      url: MediaVO.create(props.url),
      position: Position.create(props.position),
      mediaType: MediaType.create(props.mediaType),
      productId: props.productId ? Id.create(props.productId) : null,
      variantId: props.variantId ? Id.create(props.variantId) : null,
    };

    const media = new Media({
      id: Id.generate(),
      ...transformedProps,
    });

    return media;
  }

  public update(
    data: Partial<Omit<IMediaBase, 'productId' | 'variantId'>>,
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
