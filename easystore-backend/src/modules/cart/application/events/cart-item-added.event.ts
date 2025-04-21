export class CartItemAddedEvent {
  constructor(
    public readonly userId: number,
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}
