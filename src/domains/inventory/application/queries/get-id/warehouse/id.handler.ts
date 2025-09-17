import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IWarehouseRepository } from '../../../../aggregates/repositories';
import { GetWarehouseByIdDTO } from './id.dto';
import { WarehouseMapper, WarehouseDTO } from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';
import { NotFoundException } from '@nestjs/common';
import { IProductAdapter } from '../../../ports';

@QueryHandler(GetWarehouseByIdDTO)
export class GetWarehouseByIdHandler
  implements IQueryHandler<GetWarehouseByIdDTO>
{
  constructor(
    @Inject('IWarehouseRepository')
    private readonly warehouseRepository: IWarehouseRepository,
    @Inject('IProductAdapter')
    private readonly productAdapter: IProductAdapter,
  ) {}

  async execute(query: GetWarehouseByIdDTO): Promise<WarehouseDTO | null> {
    const { id, tenantId, isArchived } = query;

    const warehouse = await this.warehouseRepository.findById(
      Id.create(id),
      Id.create(tenantId),
    );

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id ${id} not found`);
    }

    // Collect unique variantIds from warehouse stocks
    const variantIdsSet = new Set<string>();
    warehouse.get('stocks').forEach((stock) => {
      variantIdsSet.add(stock.get('variantId').getValue());
    });
    const variantIds = Array.from(variantIdsSet);

    // Fetch variant details
    const variantsDetails =
      await this.productAdapter.getVariantsDetails(variantIds);
    const detailsMap = new Map(
      variantsDetails.map((detail) => [detail.variantId, detail]),
    );

    // Get warehouse DTO
    const warehouseDto = WarehouseMapper.toDto(warehouse);

    // Enrich DTO with variant details and apply archived filtering
    warehouseDto.stockPerWarehouses = warehouseDto.stockPerWarehouses
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

    return warehouseDto;
  }
}
