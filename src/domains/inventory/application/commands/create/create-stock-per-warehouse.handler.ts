import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { CreateStockPerWarehouseDTO } from './create-stock-per-warehouse.dto';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';

@CommandHandler(CreateStockPerWarehouseDTO)
export class CreateStockPerWarehouseHandler implements ICommandHandler<CreateStockPerWarehouseDTO> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateStockPerWarehouseDTO): Promise<StockPerWarehouseDTO> {
    const stockPerWarehouse = this.eventPublisher.mergeObjectContext(
      StockPerWarehouseMapper.fromCreateDto(command.data),
    );

    await this.inventoryRepository.saveStockPerWarehouse(stockPerWarehouse);

    stockPerWarehouse.commit();

    return StockPerWarehouseMapper.toDto(stockPerWarehouse) as StockPerWarehouseDTO;
  }
} 