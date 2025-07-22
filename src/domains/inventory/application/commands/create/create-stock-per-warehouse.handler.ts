import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { CreateStockPerWarehouseDTO } from './create-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { WarehouseMapper } from '../../mappers';
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
    const stockPerWarehouse = this.eventPublisher.mergeObjectContext(
      StockPerWarehouseMapper.fromCreateDto(command.data),
    );

    // Get the warehouse aggregate root
    const warehouse = await this.inventoryRepository.getWarehouseById(
      Id.create(command.data.warehouseId),
    );
    if (!warehouse) throw new Error('Warehouse not found');
    const warehouseWithEvents =
      this.eventPublisher.mergeObjectContext(warehouse);

    // Use the aggregate root method
    warehouseWithEvents.addStockToWarehouse(stockPerWarehouse);
    warehouseWithEvents.commit();

    await this.inventoryRepository.saveStockPerWarehouse(stockPerWarehouse);
    stockPerWarehouse.commit();

    return StockPerWarehouseMapper.toDto(
      stockPerWarehouse,
    ) as StockPerWarehouseDTO;
  }
}
