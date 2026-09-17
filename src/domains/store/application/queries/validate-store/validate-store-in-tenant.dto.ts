export class ValidateStoreInTenantDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
