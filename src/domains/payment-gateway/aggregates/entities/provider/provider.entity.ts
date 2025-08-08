export class ProviderEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly providerType: string, // 'PAGADITO', 'VISANET', 'PAYPAL'
    public readonly credentials: Record<string, unknown>, // encrypted
    public readonly enabled: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
