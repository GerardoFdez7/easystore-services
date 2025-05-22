import { IEvent } from '@nestjs/cqrs';
import { Product } from '../../entities';

export class ProductHardDeletedEvent implements IEvent {
  constructor(public readonly product: Product) {}
}
