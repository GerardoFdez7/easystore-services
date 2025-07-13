import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { DeleteWarehouseDTO } from './delete-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';
import { WarehouseDeletedEvent } from '../../../aggregates/events/warehouse/warehouse-deleted.event';

@CommandHandler(DeleteWarehouseDTO)
export class DeleteWarehouseHandler implements ICommandHandler<DeleteWarehouseDTO> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteWarehouseDTO): Promise<WarehouseDTO> {
    // Buscar el warehouse antes de eliminarlo
    const warehouse = await this.inventoryRepository.deleteWarehouse(command.id);

    // Publicar el evento
    const warehouseWithEvents = this.eventPublisher.mergeObjectContext(warehouse);
    warehouseWithEvents.apply(new WarehouseDeletedEvent(warehouse));
    warehouseWithEvents.commit();

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
} 