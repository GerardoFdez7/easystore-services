import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { TenantMapper } from '../../mappers/tenant.mapper';
import { TenantDTO } from '../../mappers/tenant.dto';
import { TenantSingUpDTO } from './sing-up.dto';
import { Inject } from '@nestjs/common';

@CommandHandler(TenantSingUpDTO)
export class TenantSingUpHandler implements ICommandHandler<TenantSingUpDTO> {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: TenantSingUpDTO): Promise<TenantDTO> {
    // Create domain entity using factory method
    const tenant = this.eventPublisher.mergeObjectContext(
      TenantMapper.fromCreateDto(command),
    );

    // Persist through repository
    await this.tenantRepository.save(tenant);

    // Commit events to event bus
    tenant.commit();

    // Return the tenant DTO
    return TenantMapper.toDto(tenant);
  }
}
