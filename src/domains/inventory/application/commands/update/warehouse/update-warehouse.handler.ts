import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { UpdateWarehouseDTO } from './update-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@shared/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateWarehouseDTO)
export class UpdateWarehouseHandler
  implements ICommandHandler<UpdateWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateWarehouseDTO): Promise<WarehouseDTO> {
    const warehouse = await this.warehouseRepository.findById(
      Id.create(command.id),
      Id.create(command.tenantId),
    );
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id ${command.id} not found`);
    }

    const updatedWarehouse = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromUpdateDto(warehouse, command.data),
    );

    await this.warehouseRepository.update(
      Id.create(command.id),
      Id.create(command.tenantId),
      updatedWarehouse,
      {},
    );

    updatedWarehouse.commit();

    return WarehouseMapper.toDto(updatedWarehouse);
  }
}
