import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { UpdateStockPerWarehouseDTO } from './update-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { StockPerWarehouseUpdatedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-updated.event';
import { WarehouseMapper } from '../../mappers';
import { AggregateRoot } from '@nestjs/cqrs';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateStockPerWarehouseDTO)
export class UpdateStockPerWarehouseHandler
  implements ICommandHandler<UpdateStockPerWarehouseDTO>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: UpdateStockPerWarehouseDTO,
  ): Promise<StockPerWarehouseDTO> {
    const found = await this.inventoryRepository.getStockPerWarehouseById(
      Id.create(command.id),
      Id.create(command.warehouseId),
    );
    if (!found) {
      throw new NotFoundException(
        `StockPerWarehouse with id ${command.id} and warehouseId ${command.warehouseId} not found`,
      );
    }
    const updated = await this.inventoryRepository.updateStockPerWarehouse(
      Id.create(command.id),
      Id.create(command.warehouseId),
      command.updates,
    );
    const stockWithEvents = this.eventPublisher.mergeObjectContext(updated);

    // Get the warehouse aggregate root
    const warehouse = await this.inventoryRepository.getWarehouseById(
      updated.getWarehouseId(),
    );
    if (!warehouse) throw new Error('Warehouse not found');
    const warehouseWithEvents =
      this.eventPublisher.mergeObjectContext(warehouse);

    // Use the aggregate root method
    warehouseWithEvents.updateStockInWarehouse(updated);
    // No commit call here

    stockWithEvents.apply(new StockPerWarehouseUpdatedEvent(updated));
    // No commit call here
    return StockPerWarehouseMapper.toDto(updated) as StockPerWarehouseDTO;
  }
}
