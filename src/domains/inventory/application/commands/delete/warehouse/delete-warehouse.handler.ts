import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { DeleteWarehouseDTO } from './delete-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteWarehouseDTO)
export class DeleteWarehouseHandler
  implements ICommandHandler<DeleteWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteWarehouseDTO): Promise<WarehouseDTO> {
    const warehouse = await this.warehouseRepository.findById(
      Id.create(command.id),
      Id.create(command.tenantId),
    );
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id ${command.id} not found`);
    }

    const warehouseDeleted = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromDeleteDto(warehouse),
    );

    await this.warehouseRepository.delete(
      Id.create(command.id),
      Id.create(command.tenantId),
    );

    warehouseDeleted.commit();

    return WarehouseMapper.toDto(warehouseDeleted);
  }
}
