import { Product, Variant, Media } from '../../entities';

export class MediaDeletedEvent {
  constructor(
    public readonly product: Product | Variant,
    public readonly deletedMedia: Media,
  ) {}
}
