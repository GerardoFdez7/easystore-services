import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { DeleteWarehouseDTO } from './delete-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';
import { WarehouseDeletedEvent } from '../../../aggregates/events/warehouse/warehouse-deleted.event';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteWarehouseDTO)
export class DeleteWarehouseHandler
  implements ICommandHandler<DeleteWarehouseDTO>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteWarehouseDTO): Promise<WarehouseDTO> {
    const found = await this.inventoryRepository.getWarehouseById(
      Id.create(command.id),
    );
    if (!found) {
      throw new NotFoundException(`Warehouse with id ${command.id} not found`);
    }
    const warehouse = await this.inventoryRepository.deleteWarehouse(
      Id.create(command.id),
      Id.create(command.tenantId),
    );

    const warehouseWithEvents =
      this.eventPublisher.mergeObjectContext(warehouse);
    warehouseWithEvents.apply(new WarehouseDeletedEvent(warehouse));
    warehouseWithEvents.commit();

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
}
