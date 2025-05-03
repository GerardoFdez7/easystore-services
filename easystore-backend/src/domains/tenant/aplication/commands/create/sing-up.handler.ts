import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.repository.interface';
import { Tenant } from '../../../aggregates/entities/tenant.entity';
import { TenantSingUpDTO } from './sing-up.dto';
import { Inject } from '@nestjs/common';

@CommandHandler(TenantSingUpDTO)
export class TenantSingUpHandler implements ICommandHandler<TenantSingUpDTO> {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: TenantSingUpDTO): Promise<void> {
    const { businessName, ownerName, email, password } = command;

    // Create domain entity using factory method
    const tenant = this.eventPublisher.mergeObjectContext(
      Tenant.create(businessName, ownerName, email, password),
    );

    // Persist through repository
    await this.tenantRepository.create(tenant);

    // Commit events to event bus
    tenant.commit();
  }
}
