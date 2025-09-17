import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IStockMovementRepository } from '../../../../aggregates/repositories';
import { GetAllStockMovementsDTO } from './all-movements.dto';
import {
  StockMovementMapper,
  PaginatedStockMovementsDTO,
} from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';
import { IProductAdapter } from '../../../ports';

@QueryHandler(GetAllStockMovementsDTO)
export class GetAllStockMovementsHandler
  implements IQueryHandler<GetAllStockMovementsDTO>
{
  constructor(
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject('IProductAdapter')
    private readonly productAdapter: IProductAdapter,
  ) {}

  async execute(
    query: GetAllStockMovementsDTO,
  ): Promise<PaginatedStockMovementsDTO> {
    const { warehouseId, options } = query;
    const {
      page,
      limit,
      variantId,
      createdById,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      includeDeleted,
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

    const stockMovements = await this.stockMovementRepository.findAll(
      Id.create(warehouseId),
      {
        page,
        limit,
        variantId: variantId ? Id.create(variantId) : undefined,
        createdById: createdById ? Id.create(createdById) : undefined,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
        includeDeleted,
      },
    );

    if (!stockMovements || stockMovements.total === 0) {
      throw new NotFoundException(`No stock movements found`);
    }

    // Collect unique variant IDs from stock movements
    const variantIds = new Set<string>();
    stockMovements.movements.forEach((movement) => {
      const variantId = movement.getVariantId();
      if (variantId) {
        variantIds.add(variantId);
      }
    });

    // Fetch variant details if we have variant IDs
    let detailsMap = new Map<
      string,
      {
        productName: string;
        variantSku: string;
        variantFirstAttribute: { key: string; value: string };
      }
    >();
    if (variantIds.size > 0) {
      const variantDetails = await this.productAdapter.getVariantsDetails(
        Array.from(variantIds),
      );

      // Create a map for quick lookup
      detailsMap = new Map(
        variantDetails.map((detail) => [
          detail.variantId,
          {
            productName: detail.productName,
            variantSku: detail.sku,
            variantFirstAttribute: detail.firstAttribute,
          },
        ]),
      );
    }

    // Convert to paginated DTO with variant details
    const paginatedResult = StockMovementMapper.toPaginatedDto(
      stockMovements,
      undefined,
      detailsMap,
    );

    return paginatedResult;
  }
}
