import { Module } from '@nestjs/common';

@Module({
  imports: [
    // Add imports here (e.g., infrastructure, application modules)
  ],
  providers: [
    // Add providers here (e.g., services, handlers)
  ],
  exports: [
    // Export providers/services as needed
  ],
})
export class PaymentGatewayModule {}
