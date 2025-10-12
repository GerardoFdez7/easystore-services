import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentCredentialsDto } from './create-payment-credentials.dto';
import { PaymentCredentialsRepository } from '../../../aggregates/repositories/payment-credentials.interface';
import { PaymentCredentialsEntity } from '../../../aggregates/entities/payment-credentials/payment-credentials.entity';
import { CredentialsEncryptionService } from '../../../infrastructure/encryption/credentials-encryption.service';

export class CreatePaymentCredentialsCommand {
  constructor(public readonly dto: CreatePaymentCredentialsDto) {}
}

@CommandHandler(CreatePaymentCredentialsCommand)
@Injectable()
export class CreatePaymentCredentialsHandler
  implements ICommandHandler<CreatePaymentCredentialsCommand>
{
  constructor(
    @Inject('PaymentCredentialsRepository')
    private readonly repository: PaymentCredentialsRepository,
    private readonly encryptionService: CredentialsEncryptionService,
  ) {}

  async execute(command: CreatePaymentCredentialsCommand): Promise<void> {
    const { dto } = command;

    // Check if credentials already exist for this tenant and provider
    const existingCredentials = await this.repository.findByTenantAndProvider(
      dto.tenantId,
      dto.providerType,
    );

    if (existingCredentials) {
      throw new Error(
        `Payment credentials for provider ${dto.providerType.value} already exist for tenant ${dto.tenantId}`,
      );
    }

    // Encrypt the credentials
    const encryptedCredentials = this.encryptionService.encrypt(
      dto.credentials,
    );

    // Create the entity
    const credentialsEntity = PaymentCredentialsEntity.create({
      id: uuidv4(),
      tenantId: dto.tenantId,
      providerType: dto.providerType,
      encryptedCredentials,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to repository
    await this.repository.save(credentialsEntity);
  }
}
