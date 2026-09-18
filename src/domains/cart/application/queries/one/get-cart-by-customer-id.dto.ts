export class GetCartByCustomerIdDTO {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
