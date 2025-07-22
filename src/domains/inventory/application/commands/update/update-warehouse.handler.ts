import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { UpdateWarehouseDTO } from './update-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';
import { WarehouseUpdatedEvent } from '../../../aggregates/events/warehouse/warehouse-updated.event';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateWarehouseDTO)
export class UpdateWarehouseHandler
  implements ICommandHandler<UpdateWarehouseDTO>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateWarehouseDTO): Promise<WarehouseDTO> {
    const found = await this.inventoryRepository.getWarehouseById(
      Id.create(command.id),
    );
    if (!found) {
      throw new NotFoundException(`Warehouse with id ${command.id} not found`);
    }

    const updatedWarehouse = WarehouseMapper.fromUpdateDto(
      { id: command.id } as any,
      command.data,
    );

    const warehouse = await this.inventoryRepository.updateWarehouse(
      Id.create(command.id),
      Id.create(command.tenantId),
      updatedWarehouse,
    );

    const warehouseWithEvents =
      this.eventPublisher.mergeObjectContext(warehouse);
    warehouseWithEvents.apply(new WarehouseUpdatedEvent(warehouse));
    warehouseWithEvents.commit();

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
}
