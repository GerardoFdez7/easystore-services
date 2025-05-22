import { Product, Variant, Media } from '../../entities';

export class MediaCreatedEvent {
  constructor(
    public readonly product: Product | Variant,
    public readonly mediaCreated: Media,
  ) {}
}
