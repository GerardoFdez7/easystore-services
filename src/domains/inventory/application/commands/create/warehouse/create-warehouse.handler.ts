import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { CreateWarehouseDTO } from './create-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';

@CommandHandler(CreateWarehouseDTO)
export class CreateWarehouseHandler
  implements ICommandHandler<CreateWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateWarehouseDTO): Promise<WarehouseDTO> {
    const warehouse = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromCreateDto(command.data),
    );

    await this.warehouseRepository.create(warehouse);

    warehouse.commit();

    return WarehouseMapper.toDto(warehouse);
  }
}
