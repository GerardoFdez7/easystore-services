import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IStockMovementRepository } from '../../../../aggregates/repositories';
import { GetAllStockMovementsDTO } from './all-movements.dto';
import {
  StockMovementMapper,
  PaginatedStockMovementsDTO,
} from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';

@QueryHandler(GetAllStockMovementsDTO)
export class GetAllStockMovementsHandler
  implements IQueryHandler<GetAllStockMovementsDTO>
{
  constructor(
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(
    query: GetAllStockMovementsDTO,
  ): Promise<PaginatedStockMovementsDTO> {
    const { tenantId, options } = query;
    const {
      page,
      limit,
      warehouseId,
      variantId,
      createdById,
      dateFrom,
      dateTo,
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

    const result = await this.stockMovementRepository.findAll(
      Id.create(tenantId),
      {
        page,
        limit,
        warehouseId: Id.create(warehouseId),
        variantId: Id.create(variantId),
        createdById: Id.create(createdById),
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
    );

    if (!result || result.total === 0) {
      throw new NotFoundException(`No stock movements found`);
    }

    return StockMovementMapper.toPaginatedDto(result);
  }
}
