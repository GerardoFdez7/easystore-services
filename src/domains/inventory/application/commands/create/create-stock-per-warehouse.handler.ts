import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { CreateStockPerWarehouseDTO } from './create-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { Id } from '@domains/value-objects';

@CommandHandler(CreateStockPerWarehouseDTO)
export class CreateStockPerWarehouseHandler
  implements ICommandHandler<CreateStockPerWarehouseDTO>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: CreateStockPerWarehouseDTO,
  ): Promise<StockPerWarehouseDTO> {
    // Get the warehouse aggregate root
    const warehouse = await this.inventoryRepository.getWarehouseById(
      Id.create(command.data.warehouseId),
    );
    if (!warehouse) throw new Error('Warehouse not found');

    // Use the aggregate root method - it creates the stock entity and applies domain events
    const warehouseWithEvents =
      this.eventPublisher.mergeObjectContext(warehouse);
    warehouseWithEvents.addStockToWarehouse(command.data);
    warehouseWithEvents.commit();

    // Create the stock entity for persistence
    const stockPerWarehouse = StockPerWarehouseMapper.fromCreateDto(
      command.data,
    );
    await this.inventoryRepository.saveStockPerWarehouse(stockPerWarehouse);

    return StockPerWarehouseMapper.toDto(stockPerWarehouse);
  }
}
