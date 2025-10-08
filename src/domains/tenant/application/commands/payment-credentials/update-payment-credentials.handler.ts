import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePaymentCredentialsDto } from './update-payment-credentials.dto';
import { PaymentCredentialsRepository } from '../../../aggregates/repositories/payment-credentials.interface';
import { CredentialsEncryptionService } from '../../../infrastructure/encryption/credentials-encryption.service';

export class UpdatePaymentCredentialsCommand {
  constructor(public readonly dto: UpdatePaymentCredentialsDto) {}
}

@CommandHandler(UpdatePaymentCredentialsCommand)
@Injectable()
export class UpdatePaymentCredentialsHandler
  implements ICommandHandler<UpdatePaymentCredentialsCommand>
{
  constructor(
    @Inject('PaymentCredentialsRepository')
    private readonly repository: PaymentCredentialsRepository,
    private readonly encryptionService: CredentialsEncryptionService,
  ) {}

  async execute(command: UpdatePaymentCredentialsCommand): Promise<void> {
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

    // Encrypt the new credentials
    const encryptedCredentials = this.encryptionService.encrypt(
      dto.credentials,
    );

    // Update the entity
    const updatedCredentials =
      existingCredentials.updateCredentials(encryptedCredentials);

    // Save to repository
    await this.repository.save(updatedCredentials);
  }
}
