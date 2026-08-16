import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { DeleteWarehouseDTO } from './delete-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@shared/value-objects';
import { findWarehouseOrThrow } from '../../find-warehouse-or-throw';

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
    const warehouse = await findWarehouseOrThrow(
      this.warehouseRepository,
      command.id,
      command.tenantId,
    );

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
