import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { GetWarehouseByIdDTO } from './id.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetWarehouseByIdDTO)
export class GetWarehouseByIdHandler
  implements IQueryHandler<GetWarehouseByIdDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  async execute(query: GetWarehouseByIdDTO): Promise<WarehouseDTO | null> {
    const warehouse = await this.warehouseRepository.findById(
      Id.create(query.id),
      Id.create(query.tenantId),
    );

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id ${query.id} not found`);
    }

    return WarehouseMapper.toDto(warehouse);
  }
}
