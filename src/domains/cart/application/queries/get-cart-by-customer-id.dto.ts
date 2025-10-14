export class GetCartByCustomerIdDTO {
  constructor(
    public readonly id: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
