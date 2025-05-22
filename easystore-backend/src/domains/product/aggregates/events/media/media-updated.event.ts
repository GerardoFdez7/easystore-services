import { Product, Variant, Media } from '../../entities';

export class MediaUpdatedEvent {
  constructor(
    public readonly product: Product | Variant,
    public readonly updatedMedia: Media,
  ) {}
}
