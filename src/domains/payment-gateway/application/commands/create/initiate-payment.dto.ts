export class InitiatePaymentDto {
  constructor(
    public readonly tenantId: string,
    public readonly providerType: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId: string,
  ) {}
}
