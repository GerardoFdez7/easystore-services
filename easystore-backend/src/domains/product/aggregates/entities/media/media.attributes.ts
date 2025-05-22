import { MediaTypeEnum } from '../../value-objects';

export interface IMediaType extends IMediaBase, IMediaSystem {}

export interface IMediaBase {
  url: string;
  position: number;
  mediaType: MediaTypeEnum;
  productId?: number | null;
  variantId?: number | null;
}

export interface IMediaSystem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
