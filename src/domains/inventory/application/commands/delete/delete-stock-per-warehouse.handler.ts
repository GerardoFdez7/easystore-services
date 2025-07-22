import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { DeleteStockPerWarehouseDTO } from './delete-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { StockPerWarehouseDeletedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-deleted.event';
import { WarehouseMapper } from '../../mappers';
import { AggregateRoot } from '@nestjs/cqrs';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteStockPerWarehouseDTO)
export class DeleteStockPerWarehouseHandler
  implements ICommandHandler<DeleteStockPerWarehouseDTO>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: DeleteStockPerWarehouseDTO,
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
    const stock = await this.inventoryRepository.deleteStockPerWarehouse(
      Id.create(command.id),
      Id.create(command.warehouseId),
    );
    // Get the warehouse aggregate root
    const warehouse = await this.inventoryRepository.getWarehouseById(
      stock.getWarehouseId(),
    );
    if (!warehouse) throw new Error('Warehouse not found');
    const warehouseWithEvents =
      this.eventPublisher.mergeObjectContext(warehouse);

    // Use the aggregate root method and apply the event from the root
    warehouseWithEvents.removeStockFromWarehouse(stock);
    warehouseWithEvents.apply(new StockPerWarehouseDeletedEvent(stock));
    warehouseWithEvents.commit();

    return StockPerWarehouseMapper.toDto(stock) as StockPerWarehouseDTO;
  }
}
