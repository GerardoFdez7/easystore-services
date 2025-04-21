export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
}

export class UpdateProductCommand {
  constructor(
    public readonly id: string,
    public readonly clientId: number,
    public readonly data: ProductUpdateData,
  ) {}
}
