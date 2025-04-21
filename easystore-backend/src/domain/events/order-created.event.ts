export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: number,
    public readonly clientId: number,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly timestamp: string,
  ) {}
}
