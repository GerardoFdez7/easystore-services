import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePaymentCredentialsDto } from './delete-payment-credentials.dto';
import { PaymentCredentialsRepository } from '../../../aggregates/repositories/payment-credentials.interface';

export class DeletePaymentCredentialsCommand {
  constructor(public readonly dto: DeletePaymentCredentialsDto) {}
}

@CommandHandler(DeletePaymentCredentialsCommand)
@Injectable()
export class DeletePaymentCredentialsHandler
  implements ICommandHandler<DeletePaymentCredentialsCommand>
{
  constructor(
    @Inject('PaymentCredentialsRepository')
    private readonly repository: PaymentCredentialsRepository,
  ) {}

  async execute(command: DeletePaymentCredentialsCommand): Promise<void> {
    const { dto } = command;

    // Find existing credentials
    const existingCredentials = await this.repository.findByTenantAndProvider(
      dto.tenantId,
      dto.providerType,
    );

    if (!existingCredentials) {
      throw new Error(
        `Payment credentials for provider ${dto.providerType.value} not found for tenant ${dto.tenantId}`,
      );
    }

    // Delete from repository
    await this.repository.delete(existingCredentials.toAttributes().id);
  }
}
