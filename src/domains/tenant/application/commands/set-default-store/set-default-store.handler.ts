import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import { ITenantRepository } from '../../../aggregates/repositories';
import { TenantMapper, TenantDTO } from '../../mappers';
import { IStoreOwnershipAdapter } from '../../ports';
import { SetDefaultStoreDTO } from './set-default-store.dto';

/** Changes the default only after Store ownership has been confirmed by its query. */
@CommandHandler(SetDefaultStoreDTO)
export class SetDefaultStoreHandler
  implements ICommandHandler<SetDefaultStoreDTO>
{
  constructor(
    @Inject('ITenantRepository') private readonly repository: ITenantRepository,
    @Inject('IStoreOwnershipAdapter')
    private readonly storeOwnership: IStoreOwnershipAdapter,
    private readonly publisher: EventPublisher,
  ) {}
  async execute(command: SetDefaultStoreDTO): Promise<TenantDTO> {
    const tenant = await this.repository.findById(Id.create(command.tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (
      !(await this.storeOwnership.belongsToTenant(
        command.storeId,
        command.tenantId,
      ))
    ) {
      throw new NotFoundException('Store not found');
    }
    const aggregate = this.publisher.mergeObjectContext(tenant);
    aggregate.setDefaultStore(command.storeId);
    const saved = await this.repository.update(
      Id.create(command.tenantId),
      aggregate,
    );
    aggregate.commit();
    return TenantMapper.toDto(saved);
  }
}
