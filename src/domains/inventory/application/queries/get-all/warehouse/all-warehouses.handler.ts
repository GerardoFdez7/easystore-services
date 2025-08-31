import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { GetAllWarehousesDTO } from './all-warehouses.dto';
import { WarehouseMapper, PaginatedWarehousesDTO } from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';
import IProductAdapter from '../../../ports/product.port';

@QueryHandler(GetAllWarehousesDTO)
export class GetAllWarehousesHandler
  implements IQueryHandler<GetAllWarehousesDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    @Inject('IProductAdapter')
    private readonly productAdapter: IProductAdapter,
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
      isArchived,
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
      addressId: addressId ? Id.create(addressId) : undefined,
      variantId: variantId ? Id.create(variantId) : undefined,
      lowStockThreshold,
      sortBy,
      sortOrder,
    });

    if (!result || result.total === 0) {
      throw new NotFoundException(`No warehouses found`);
    }

    // Collect unique variantIds
    const variantIdsSet = new Set<string>();
    result.warehouses.forEach((warehouse) => {
      warehouse.get('stocks').forEach((stock) => {
        variantIdsSet.add(stock.get('variantId').getValue());
      });
    });
    const variantIds = Array.from(variantIdsSet);

    // Fetch variant details
    const variantsDetails =
      await this.productAdapter.getVariantsDetails(variantIds);
    const detailsMap = new Map(
      variantsDetails.map((detail) => [detail.variantId, detail]),
    );

    // Get paginated DTO
    const paginated = WarehouseMapper.toPaginatedDto(result);

    // Enrich DTOs
    paginated.warehouses = paginated.warehouses.map((dto) => {
      dto.stockPerWarehouses = dto.stockPerWarehouses
        .filter((stockDto) => {
          if (isArchived === undefined) return true;
          const detail = detailsMap.get(stockDto.variantId);
          return detail ? detail.isArchived === isArchived : false;
        })
        .map((stockDto) => {
          const detail = detailsMap.get(stockDto.variantId);
          if (detail) {
            return {
              ...stockDto,
              productName: detail.productName,
              variantSku: detail.sku,
              variantFirstAttribute: detail.firstAttribute,
            };
          }
          return stockDto;
        });
      return dto;
    });

    return paginated;
  }
}
