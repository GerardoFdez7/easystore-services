export class PaymentInitiatedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly provider: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId: string,
    public readonly initiatedAt: Date = new Date(),
  ) {}
}
