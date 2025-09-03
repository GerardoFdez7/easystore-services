export class InitiatePaymentDto {
  constructor(
    public readonly tenantId: string,
    public readonly providerType: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId: string,
    public readonly details?: Array<{
      quantity: number;
      description: string;
      price: number;
      urlProduct?: string;
    }>,
    public readonly customParams?: Record<string, unknown>,
    public readonly allowPendingPayments?: boolean,
    public readonly externalReferenceNumber?: string,
  ) {}
}
