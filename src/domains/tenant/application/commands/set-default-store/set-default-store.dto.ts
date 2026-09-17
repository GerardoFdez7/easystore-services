export class SetDefaultStoreDTO {
  constructor(
    public readonly tenantId: string,
    public readonly storeId: string,
  ) {}
}
