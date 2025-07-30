import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { UpdateStockPerWarehouseDTO } from './update-stock-per-warehouse.dto';
import {
  StockPerWarehouseMapper,
  StockPerWarehouseDTO,
  WarehouseMapper,
} from '../../mappers';
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
    const warehouseFound = await this.inventoryRepository.getWarehouseById(
      Id.create(command.warehouseId),
    );
    if (!warehouseFound) {
      throw new NotFoundException(`Warehouse with id ${command.id} not found`);
    }
    const stockPerWarehouseFound =
      await this.inventoryRepository.getStockPerWarehouseById(
        Id.create(command.id),
        Id.create(command.warehouseId),
      );
    // Merge context and commit events to event bus
    const stockWithEvents = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromUpdateStockInWarehouse(
        warehouseFound,
        stockPerWarehouseFound,
        command.updates,
      ),
    );
    await this.inventoryRepository.updateStockPerWarehouse(
      Id.create(command.id),
      Id.create(command.warehouseId),
      command.updates,
    );
    stockWithEvents.commit();

    return StockPerWarehouseMapper.toDto(stockPerWarehouseFound);
  }
}
