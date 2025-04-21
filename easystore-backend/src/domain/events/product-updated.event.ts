export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  [key: string]: unknown;
}

export class ProductUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly clientId: number,
    public readonly categoryId?: string,
    public readonly product?: ProductData,
  ) {}
}
