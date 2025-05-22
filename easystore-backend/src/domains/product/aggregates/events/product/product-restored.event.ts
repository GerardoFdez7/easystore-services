import { IEvent } from '@nestjs/cqrs';
import { Product } from '../../entities';

export class ProductRestoredEvent implements IEvent {
  constructor(public readonly product: Product) {}
}
