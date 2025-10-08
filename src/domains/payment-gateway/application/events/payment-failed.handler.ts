import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentFailedEvent } from '../../aggregates/events/payment/payment-failed.event';
import { Logger } from '@nestjs/common';

@EventsHandler(PaymentFailedEvent)
export class PaymentFailedHandler implements IEventHandler<PaymentFailedEvent> {
  private readonly logger = new Logger(PaymentFailedHandler.name);

  async handle(event: PaymentFailedEvent): Promise<void> {
    this.logger.warn(
      `Payment failed: ${event.paymentId} for tenant ${event.tenantId}. Reason: ${event.failureReason}`,
    );

    try {
      // Send failure notification to tenant
      await this.sendFailureNotification(event);

      // Update order status
      await this.updateOrderStatus(event);

      // Log failure for analysis
      await this.logFailureForAnalysis(event);

      // Update analytics
      await this.updateAnalytics(event);
    } catch (error) {
      this.logger.error(
        `Error handling payment failed event for payment ${event.paymentId}:`,
        error,
      );
    }
  }

  private async sendFailureNotification(
    event: PaymentFailedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Sending failure notification for payment ${event.paymentId} to tenant ${event.tenantId}. Reason: ${event.failureReason}`,
    );

    // Simulate async operation (e.g., email, SMS, push notification)
    await new Promise((resolve) => setTimeout(resolve, 120));

    this.logger.debug(
      `Failure notification sent for payment ${event.paymentId}`,
    );
  }

  private async updateOrderStatus(event: PaymentFailedEvent): Promise<void> {
    this.logger.debug(
      `Updating order status to FAILED for order ${event.orderId}`,
    );

    // Simulate async operation (e.g., database update, external order system)
    await new Promise((resolve) => setTimeout(resolve, 180));

    this.logger.debug(
      `Order status updated to FAILED for order ${event.orderId}`,
    );
  }

  private async logFailureForAnalysis(
    event: PaymentFailedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Logging failure details for analysis: payment ${event.paymentId}, reason: ${event.failureReason}`,
    );

    // Simulate async operation (e.g., external logging service, analytics database)
    await new Promise((resolve) => setTimeout(resolve, 80));

    this.logger.debug(
      `Failure logged successfully for analysis: payment ${event.paymentId}`,
    );
  }

  private async updateAnalytics(event: PaymentFailedEvent): Promise<void> {
    this.logger.debug(
      `Updating analytics for failed payment ${event.paymentId} with reason: ${event.failureReason}`,
    );

    // Simulate async operation (e.g., analytics database, external analytics service)
    await new Promise((resolve) => setTimeout(resolve, 90));

    this.logger.debug(
      `Analytics updated for failed payment ${event.paymentId}`,
    );
  }
}
