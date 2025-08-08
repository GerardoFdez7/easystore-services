export class ProviderDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly providerType: string,
    public readonly credentials: Record<string, unknown>,
    public readonly enabled: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
