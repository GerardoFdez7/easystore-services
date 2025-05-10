import { IEvent } from '@nestjs/cqrs';
import { Product } from '../../entities/product.entity';

export class ProductRestoredEvent implements IEvent {
  constructor(public readonly product: Product) {}
}
