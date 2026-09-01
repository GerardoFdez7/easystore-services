export class GetCartByCustomerIdDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
