import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { CreateStockPerWarehouseDTO } from './create-stock-per-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@domains/value-objects';

@CommandHandler(CreateStockPerWarehouseDTO)
export class CreateStockPerWarehouseHandler
  implements ICommandHandler<CreateStockPerWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateStockPerWarehouseDTO): Promise<WarehouseDTO> {
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
      WarehouseMapper.fromAddStockToWarehouse(warehouse, command.data),
    );

    await this.warehouseRepository.update(
      Id.create(command.warehouseId),
      Id.create(command.tenantId),
      updatedWarehouse,
    );

    updatedWarehouse.commit();

    return WarehouseMapper.toDto(updatedWarehouse);
  }
}
