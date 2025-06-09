import { IEvent } from '@nestjs/cqrs';
import { Product } from '../../entities';

export class ProductUpdatedEvent implements IEvent {
  constructor(public readonly product: Product) {}
}
