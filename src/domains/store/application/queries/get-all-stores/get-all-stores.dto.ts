export class GetAllStoresDTO {
  constructor(
    public readonly tenantId: string,
    public readonly page = 1,
    public readonly limit = 20,
  ) {}
}
