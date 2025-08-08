export class PaymentGatewayEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly provider: string, // e.g., 'PAGADITO', 'VISANET', 'PAYPAL'
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: string, // e.g., 'PENDING', 'COMPLETED', 'FAILED'
    public readonly orderId: string,
    public readonly transactionId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly metadata?: Record<string, unknown>, // for provider-specific data
  ) {}
}
