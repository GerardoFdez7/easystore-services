export class GetAddressesDetailsDTO {
  constructor(
    public readonly addressIds: string[],
    public readonly tenantId: string,
  ) {}
}
