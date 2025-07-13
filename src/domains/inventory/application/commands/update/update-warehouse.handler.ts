import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { UpdateWarehouseDTO } from './update-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';
import { WarehouseUpdatedEvent } from '../../../aggregates/events/warehouse/warehouse-updated.event';

@CommandHandler(UpdateWarehouseDTO)
export class UpdateWarehouseHandler implements ICommandHandler<UpdateWarehouseDTO> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateWarehouseDTO): Promise<WarehouseDTO> {
    // Crear la entidad de dominio con los datos actualizados
    const updatedWarehouse = WarehouseMapper.fromUpdateDto(
      { id: command.id } as any, // Placeholder para la entidad existente
      command.data
    );

    // Actualizar el warehouse
    const warehouse = await this.inventoryRepository.updateWarehouse(
      command.id,
      updatedWarehouse
    );

    // Publicar el evento
    const warehouseWithEvents = this.eventPublisher.mergeObjectContext(warehouse);
    warehouseWithEvents.apply(new WarehouseUpdatedEvent(warehouse));
    warehouseWithEvents.commit();

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
} 