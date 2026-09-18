import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { CreateWarehouseDTO } from './create-warehouse.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { IAddressAdapter } from '../../../ports';

@CommandHandler(CreateWarehouseDTO)
export class CreateWarehouseHandler
  implements ICommandHandler<CreateWarehouseDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly eventPublisher: EventPublisher,
    @Inject('IAddressAdapter')
    private readonly addressAdapter: IAddressAdapter,
  ) {}

  async execute(command: CreateWarehouseDTO): Promise<WarehouseDTO> {
    const addresses = await this.addressAdapter.getAddressDetails(
      [command.data.addressId],
      command.tenantId,
    );
    if (addresses.length !== 1) {
      throw new NotFoundException('Address not found');
    }
    const warehouse = this.eventPublisher.mergeObjectContext(
      WarehouseMapper.fromCreateDto(command.data),
    );

    await this.warehouseRepository.create(warehouse);

    warehouse.commit();

    return WarehouseMapper.toDto(warehouse);
  }
}
