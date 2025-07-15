import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { UpdateStockPerWarehouseDTO } from './update-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { StockPerWarehouseUpdatedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-updated.event';

@CommandHandler(UpdateStockPerWarehouseDTO)
export class UpdateStockPerWarehouseHandler implements ICommandHandler<UpdateStockPerWarehouseDTO> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateStockPerWarehouseDTO): Promise<StockPerWarehouseDTO> {
    const updated = await this.inventoryRepository.updateStockPerWarehouse(command.id, command.updates);
    const stockWithEvents = this.eventPublisher.mergeObjectContext(updated);
    stockWithEvents.apply(new StockPerWarehouseUpdatedEvent(updated));
    stockWithEvents.commit();
    return StockPerWarehouseMapper.toDto(updated) as StockPerWarehouseDTO;
  }
} 