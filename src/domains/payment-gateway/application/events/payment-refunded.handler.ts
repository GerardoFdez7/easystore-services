import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentRefundedEvent } from '../../aggregates/events/payment/payment-refunded.event';
import { Logger } from '@nestjs/common';

@EventsHandler(PaymentRefundedEvent)
export class PaymentRefundedHandler
  implements IEventHandler<PaymentRefundedEvent>
{
  private readonly logger = new Logger(PaymentRefundedHandler.name);

  async handle(event: PaymentRefundedEvent): Promise<void> {
    this.logger.log(
      `Payment refunded: ${event.paymentId} for tenant ${event.tenantId}. Amount: ${event.refundAmount} (${event.isPartialRefund ? 'partial' : 'full'})`,
    );

    try {
      // Send refund notification to tenant
      await this.sendRefundNotification(event);

      // Update order status
      await this.updateOrderStatus(event);

      // Process inventory adjustments if needed
      await this.processInventoryAdjustments(event);

      // Update analytics
      await this.updateAnalytics(event);
    } catch (error) {
      this.logger.error(
        `Error handling payment refunded event for payment ${event.paymentId}:`,
        error,
      );
    }
  }

  private async sendRefundNotification(
    event: PaymentRefundedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Sending refund notification for payment ${event.paymentId} to tenant ${event.tenantId}. Amount: ${event.refundAmount} (${event.isPartialRefund ? 'partial' : 'full'} refund)`,
    );

    // Simulate async operation (e.g., email, SMS, push notification)
    await new Promise((resolve) => setTimeout(resolve, 130));

    this.logger.debug(
      `Refund notification sent for payment ${event.paymentId}`,
    );
  }

  private async updateOrderStatus(event: PaymentRefundedEvent): Promise<void> {
    this.logger.debug(
      `Updating order status to REFUNDED for order ${event.orderId}`,
    );

    // Simulate async operation (e.g., database update, external order system)
    await new Promise((resolve) => setTimeout(resolve, 220));

    this.logger.debug(
      `Order status updated to REFUNDED for order ${event.orderId}`,
    );
  }

  private async processInventoryAdjustments(
    event: PaymentRefundedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Processing inventory adjustments for order ${event.orderId} - ${event.isPartialRefund ? 'partial' : 'full'} refund`,
    );

    // Simulate async operation (e.g., inventory management system, warehouse system)
    await new Promise((resolve) => setTimeout(resolve, 250));

    this.logger.debug(
      `Inventory adjustments processed successfully for order ${event.orderId}`,
    );
  }

  private async updateAnalytics(event: PaymentRefundedEvent): Promise<void> {
    this.logger.debug(
      `Updating analytics for refunded payment ${event.paymentId} - amount: ${event.refundAmount} (${event.isPartialRefund ? 'partial' : 'full'})`,
    );

    // Simulate async operation (e.g., analytics database, external analytics service)
    await new Promise((resolve) => setTimeout(resolve, 110));

    this.logger.debug(
      `Analytics updated for refunded payment ${event.paymentId}`,
    );
  }
}
