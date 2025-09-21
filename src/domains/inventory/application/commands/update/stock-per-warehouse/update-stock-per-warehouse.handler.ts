import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { UpdateStockPerWarehouseDTO } from './update-stock-per-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@shared/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateStockPerWarehouseDTO)
export class UpdateStockPerWarehouseHandler
  implements ICommandHandler<UpdateStockPerWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateStockPerWarehouseDTO): Promise<WarehouseDTO> {
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
      WarehouseMapper.fromUpdateStockInWarehouse(
        warehouse,
        command.stockId,
        command.data,
      ),
    );

    await this.warehouseRepository.updateSingleStock(
      Id.create(command.stockId),
      Id.create(command.warehouseId),
      command.data,
      {
        reason: command.reason || 'Stock updated in this variant',
        createdById: command.createdById,
      },
    );

    updatedWarehouse.commit();

    return WarehouseMapper.toDto(updatedWarehouse);
  }
}
