import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import { IStoreRepository } from '../../../aggregates/repositories';
import { StoreMapper, StoreDTO } from '../../mappers';
import { UpdateStoreDTO } from './update-store.dto';

@CommandHandler(UpdateStoreDTO)
export class UpdateStoreHandler implements ICommandHandler<UpdateStoreDTO> {
  constructor(
    @Inject('IStoreRepository') private readonly repository: IStoreRepository,
    private readonly events: EventPublisher,
  ) {}

  async execute(command: UpdateStoreDTO): Promise<StoreDTO> {
    const id = Id.create(command.id);
    const tenantId = Id.create(command.tenantId);
    const existing = await this.repository.findByIdAndTenantId(id, tenantId);
    if (!existing)
      throw new NotFoundException(`Store with ID ${command.id} not found`);
    const updated = this.events.mergeObjectContext(
      StoreMapper.fromUpdateDto(existing, command),
    );
    const saved = await this.repository.update(id, tenantId, updated);
    updated.commit();
    return StoreMapper.toDto(saved);
  }
}
