import { IEvent } from '@nestjs/cqrs';
import { Product } from '../../entities';

export class ProductSoftDeletedEvent implements IEvent {
  constructor(public readonly product: Product) {}
}
