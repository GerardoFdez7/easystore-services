export class PaymentCompletedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly provider: string,
    public readonly transactionId: string,
    public readonly completedAt: Date = new Date(),
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
