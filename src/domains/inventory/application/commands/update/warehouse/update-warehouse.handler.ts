import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { UpdateWarehouseDTO } from './update-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '@shared/aggregates/value-objects';
import { findWarehouseOrThrow } from '../../shared/find-warehouse-or-throw';
import { IAddressAdapter } from '../../../ports';

@CommandHandler(UpdateWarehouseDTO)
export class UpdateWarehouseHandler
  implements ICommandHandler<UpdateWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
    @Inject('IAddressAdapter')
    private readonly addressAdapter: IAddressAdapter,
  ) {}

  async execute(command: UpdateWarehouseDTO): Promise<WarehouseDTO> {
    const warehouse = await findWarehouseOrThrow(
      this.warehouseRepository,
      command.id,
      command.storeId,
    );
    if (command.data.addressId) {
      const addresses = await this.addressAdapter.getAddressDetails(
        [command.data.addressId],
        command.tenantId,
      );
      if (addresses.length !== 1) {
        throw new NotFoundException('Address not found');
      }
    }

    const updatedWarehouse = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromUpdateDto(warehouse, command.data),
    );

    await this.warehouseRepository.update(
      Id.create(command.id),
      Id.create(command.storeId),
      updatedWarehouse,
      {},
    );

    updatedWarehouse.commit();

    return WarehouseMapper.toDto(updatedWarehouse);
  }
}
