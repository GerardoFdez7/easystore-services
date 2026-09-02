import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { UpdateWarehouseDTO } from './update-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@shared/aggregates/value-objects';
import { findWarehouseOrThrow } from '../../shared/find-warehouse-or-throw';

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
    const warehouse = await findWarehouseOrThrow(
      this.warehouseRepository,
      command.id,
      command.tenantId,
    );

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
