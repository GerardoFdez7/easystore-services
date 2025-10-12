import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentInitiatedEvent } from '../../aggregates/events/payment/payment-initiated.event';
import { Logger } from '@nestjs/common';

@EventsHandler(PaymentInitiatedEvent)
export class PaymentInitiatedHandler
  implements IEventHandler<PaymentInitiatedEvent>
{
  private readonly logger = new Logger(PaymentInitiatedHandler.name);

  async handle(event: PaymentInitiatedEvent): Promise<void> {
    this.logger.log(
      `Payment initiated: ${event.paymentId} for tenant ${event.tenantId} with provider ${event.providerType}`,
    );

    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Trigger webhooks
    // - Log to external systems

    try {
      // Example: Send notification to tenant
      await this.sendNotificationToTenant(event);

      // Example: Update analytics
      await this.updateAnalytics(event);
    } catch (error) {
      this.logger.error(
        `Error handling payment initiated event for payment ${event.paymentId}:`,
        error,
      );
    }
  }

  private async sendNotificationToTenant(
    event: PaymentInitiatedEvent,
  ): Promise<void> {
    // Mock implementation - simulate async notification
    this.logger.debug(
      `Sending notification for payment ${event.paymentId} to tenant ${event.tenantId}`,
    );

    // Simulate async operation (e.g., email, SMS, push notification)
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.debug(
      `Notification sent successfully for payment ${event.paymentId}`,
    );
  }

  private async updateAnalytics(event: PaymentInitiatedEvent): Promise<void> {
    // Mock implementation - simulate async analytics update
    this.logger.debug(
      `Updating analytics for payment ${event.paymentId} with provider ${event.providerType}`,
    );

    // Simulate async operation (e.g., database update, external analytics service)
    await new Promise((resolve) => setTimeout(resolve, 50));

    this.logger.debug(
      `Analytics updated successfully for payment ${event.paymentId}`,
    );
  }
}
