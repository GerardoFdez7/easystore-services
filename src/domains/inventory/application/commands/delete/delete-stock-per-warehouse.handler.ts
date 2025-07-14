import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { DeleteStockPerWarehouseDTO } from './delete-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { StockPerWarehouseDeletedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-deleted.event';

@CommandHandler(DeleteStockPerWarehouseDTO)
export class DeleteStockPerWarehouseHandler implements ICommandHandler<DeleteStockPerWarehouseDTO> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteStockPerWarehouseDTO): Promise<StockPerWarehouseDTO> {
    const stock = await this.inventoryRepository.deleteStockPerWarehouse(command.id);
    const stockWithEvents = this.eventPublisher.mergeObjectContext(stock);
    stockWithEvents.apply(new StockPerWarehouseDeletedEvent(stock));
    stockWithEvents.commit();
    return StockPerWarehouseMapper.toDto(stock) as StockPerWarehouseDTO;
  }
} 