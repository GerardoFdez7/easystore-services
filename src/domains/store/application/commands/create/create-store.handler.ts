import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CurrencyCodes } from '../../../aggregates/value-objects';
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
      StoreMapper.fromCreateDto(
        new CreateStoreDTO({
          ...command.data,
          currency:
            command.data.currency ??
            (process.env.DEFAULT_CURRENCY as CurrencyCodes | undefined) ??
            CurrencyCodes.USD,
        }),
      ),
    );
    const saved = await this.repository.create(store);
    store.commit();
    return StoreMapper.toDto(saved);
  }
}
