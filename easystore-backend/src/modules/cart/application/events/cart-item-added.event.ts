import { IEvent } from '@nestjs/cqrs';

export class CartItemAddedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}
