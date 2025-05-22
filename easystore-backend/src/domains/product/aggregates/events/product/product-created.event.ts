import { IEvent } from '@nestjs/cqrs';
import { Product } from '../../entities';

export class ProductCreatedEvent implements IEvent {
  constructor(public readonly product: Product) {}
}
