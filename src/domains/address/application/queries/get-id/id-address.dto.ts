export class GetAddressIdDto {
  constructor(
    public readonly id: string,
    public readonly tenantId?: string,
    public readonly customerId?: string,
  ) {}
}
