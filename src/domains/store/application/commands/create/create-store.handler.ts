import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { IStoreRepository } from '../../../aggregates/repositories';
import { StoreMapper, StoreDTO } from '../../mappers';
import { CreateStoreDTO } from './create-store.dto';

@CommandHandler(CreateStoreDTO)
export class CreateStoreHandler implements ICommandHandler<CreateStoreDTO> {
  constructor(
    @Inject('IStoreRepository') private readonly repository: IStoreRepository,
    private readonly events: EventPublisher,
  ) {}

  async execute(command: CreateStoreDTO): Promise<StoreDTO> {
    const store = this.events.mergeObjectContext(
      StoreMapper.fromCreateDto(command),
    );
    const saved = await this.repository.create(store);
    store.commit();
    return StoreMapper.toDto(saved);
  }
}
