import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentCompletedEvent } from '../../aggregates/events/payment/payment-completed.event';
import { Logger } from '@nestjs/common';

@EventsHandler(PaymentCompletedEvent)
export class PaymentCompletedHandler
  implements IEventHandler<PaymentCompletedEvent>
{
  private readonly logger = new Logger(PaymentCompletedHandler.name);

  async handle(event: PaymentCompletedEvent): Promise<void> {
    this.logger.log(
      `Payment completed: ${event.paymentId} for tenant ${event.tenantId} with transaction ${event.transactionId}`,
    );

    try {
      // Send success notification to tenant
      await this.sendSuccessNotification(event);

      // Update order status
      await this.updateOrderStatus(event);

      // Trigger fulfillment process
      await this.triggerFulfillment(event);

      // Update analytics
      await this.updateAnalytics(event);
    } catch (error) {
      this.logger.error(
        `Error handling payment completed event for payment ${event.paymentId}:`,
        error,
      );
    }
  }

  private async sendSuccessNotification(
    event: PaymentCompletedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Sending success notification for payment ${event.paymentId} to tenant ${event.tenantId}`,
    );

    // Simulate async operation (e.g., email, SMS, push notification)
    await new Promise((resolve) => setTimeout(resolve, 150));

    this.logger.debug(
      `Success notification sent for payment ${event.paymentId}`,
    );
  }

  private async updateOrderStatus(event: PaymentCompletedEvent): Promise<void> {
    this.logger.debug(
      `Updating order status to PAID for order ${event.orderId}`,
    );

    // Simulate async operation (e.g., database update, external order system)
    await new Promise((resolve) => setTimeout(resolve, 200));

    this.logger.debug(
      `Order status updated successfully for order ${event.orderId}`,
    );
  }

  private async triggerFulfillment(
    event: PaymentCompletedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Triggering fulfillment process for order ${event.orderId}`,
    );

    // Simulate async operation (e.g., warehouse system, shipping service)
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.logger.debug(
      `Fulfillment process triggered successfully for order ${event.orderId}`,
    );
  }

  private async updateAnalytics(event: PaymentCompletedEvent): Promise<void> {
    this.logger.debug(
      `Updating analytics for completed payment ${event.paymentId} with amount ${event.amount}`,
    );

    // Simulate async operation (e.g., analytics database, external analytics service)
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.debug(
      `Analytics updated successfully for payment ${event.paymentId}`,
    );
  }
}
