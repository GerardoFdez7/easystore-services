export class CompletePaymentDto {
  constructor(
    public readonly tenantId: string,
    public readonly providerType: string,
    public readonly paymentId: string,
  ) {}
}
