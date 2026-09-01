import { MediaTypeEnum } from '../../value-objects';

export interface IMediaType extends IMediaBase, IMediaSystem {}

export interface IMediaBase {
  url: string;
  position: number;
  mediaType: MediaTypeEnum;
  productId?: string;
  variantId?: string;
  tenantId: string;
}

export interface IMediaSystem {
  id: string;
}
