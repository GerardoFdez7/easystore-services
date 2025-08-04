import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { GetAllWarehousesDTO } from './all-warehouses.dto';
import { WarehouseMapper, PaginatedWarehousesDTO } from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';

@QueryHandler(GetAllWarehousesDTO)
export class GetAllWarehousesHandler
  implements IQueryHandler<GetAllWarehousesDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  async execute(query: GetAllWarehousesDTO): Promise<PaginatedWarehousesDTO> {
    const { tenantId, options } = query;
    const {
      page,
      limit,
      name,
      addressId,
      variantId,
      lowStockThreshold,
      sortBy,
      sortOrder,
    } = options || {};

    // Validate pagination parameters
    if (page !== undefined && page < 1) {
      throw new BadRequestException(
        'Page must be a positive number if provided',
      );
    }
    if (limit !== undefined && limit < 1) {
      throw new BadRequestException(
        'Limit must be a positive number if provided',
      );
    }

    const result = await this.warehouseRepository.findAll(Id.create(tenantId), {
      page,
      limit,
      name,
      addressId: Id.create(addressId),
      variantId: Id.create(variantId),
      lowStockThreshold,
      sortBy,
      sortOrder,
    });

    if (!result || result.total === 0) {
      throw new NotFoundException(`No warehouses found`);
    }

    return WarehouseMapper.toPaginatedDto(result);
  }
}
