import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateTenantDTO } from './update-tenant.dto';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { TenantMapper, TenantDTO } from '../../mappers';
import { Id } from '../../../aggregates/value-objects';

@CommandHandler(UpdateTenantDTO)
export class UpdateTenantHandler implements ICommandHandler<UpdateTenantDTO> {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateTenantDTO): Promise<TenantDTO> {
    // Find the tenant by auth identity ID
    const tenant = await this.tenantRepository.findByAuthIdentityId(
      Id.create(command.id),
    );
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${command.id} not found`);
    }

    // Update the tenant using the domain method
    const updatedTenant = this.eventPublisher.mergeObjectContext(
      TenantMapper.fromUpdateDto(tenant, command),
    );

    // Persist through repository
    await this.tenantRepository.update(Id.create(command.id), updatedTenant);

    // Commit events to event bus
    updatedTenant.commit();

    // Return the tenant as DTO
    return TenantMapper.toDto(updatedTenant);
  }
}
