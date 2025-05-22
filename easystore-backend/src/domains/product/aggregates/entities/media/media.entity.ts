import { Entity, EntityProps } from '@domains/entity.base';
import { Id, Url, Position, MediaType } from '../../value-objects';
import { IMediaBase } from '../';

export interface MediaProps extends EntityProps {
  id: Id;
  url: Url;
  position: Position;
  mediaType: MediaType;
  productId?: Id | null;
  variantId?: Id | null;
  updatedAt: Date;
  createdAt: Date;
}

export class Media extends Entity<MediaProps> {
  constructor(props: MediaProps) {
    super(props);
  }

  public static create(props: IMediaBase): Media {
    const transformedProps = {
      url: Url.create(props.url),
      position: Position.create(props.position),
      mediaType: MediaType.create(props.mediaType),
      productId: Id.create(props.productId),
      variantId: Id.create(props.variantId),
    };

    const media = new Media({
      id: null,
      ...transformedProps,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return media;
  }

  public update(
    data: Partial<Omit<IMediaBase, 'productId' | 'variantId'>>,
  ): void {
    if (data.url !== undefined) {
      this.props.url = Url.create(data.url);
    }
    if (data.position !== undefined) {
      this.props.position = Position.create(data.position);
    }
    if (data.mediaType !== undefined) {
      this.props.mediaType = MediaType.create(data.mediaType);
    }
    this.props.updatedAt = new Date();
  }
}
