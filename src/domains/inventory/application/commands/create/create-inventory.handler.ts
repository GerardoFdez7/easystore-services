import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { CreateInventoryDTO } from './create-inventory.dto';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';

@CommandHandler(CreateInventoryDTO)
export class CreateInventoryHandler
  implements ICommandHandler<CreateInventoryDTO>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateInventoryDTO): Promise<WarehouseDTO> {
    const warehouse = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromCreateDto(command.data),
    );

    await this.inventoryRepository.createWarehouse(warehouse);

    warehouse.commit();

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
}
