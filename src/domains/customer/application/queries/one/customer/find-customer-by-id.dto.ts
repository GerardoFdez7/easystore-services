export class FindCustomerByIdDto {
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
