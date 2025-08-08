export class PaymentFailedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly provider: string,
    public readonly reason: string,
    public readonly failedAt: Date = new Date(),
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
