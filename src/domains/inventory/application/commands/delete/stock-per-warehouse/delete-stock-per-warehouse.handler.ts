import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { DeleteStockPerWarehouseDTO } from './delete-stock-per-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteStockPerWarehouseDTO)
export class DeleteStockPerWarehouseHandler
  implements ICommandHandler<DeleteStockPerWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteStockPerWarehouseDTO): Promise<WarehouseDTO> {
    const warehouse = await this.warehouseRepository.findById(
      Id.create(command.warehouseId),
      Id.create(command.tenantId),
    );
    if (!warehouse) {
      throw new NotFoundException(
        `Warehouse with id ${command.warehouseId} not found`,
      );
    }

    const updatedWarehouse = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromRemoveStockFromWarehouse(warehouse, command.stockId),
    );

    await this.warehouseRepository.updateSingleStock(
      Id.create(command.stockId),
      Id.create(command.warehouseId),
      {
        qtyAvailable: 0,
      },
      {
        reason:
          command.reason ||
          'This variant is no longer stocked in this warehouse',
        createdById: command.createdById || undefined,
      },
    );

    updatedWarehouse.commit();

    return WarehouseMapper.toDto(updatedWarehouse);
  }
}
