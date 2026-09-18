export class GetProductByIdDTO {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
  ) {}
}
