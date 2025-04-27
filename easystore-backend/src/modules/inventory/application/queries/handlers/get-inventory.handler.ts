import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import {
  InventoryRepository,
  InventoryItem,
} from '@repositories/inventory.repository';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { Logger } from '@nestjs/common';
import { GetInventoryQuery } from '../../queries/get-inventory.query';
import { InventoryDto } from '../../../interfaces/graphql/dto/inventory.dto';

@Injectable()
@QueryHandler(GetInventoryQuery)
export class GetInventoryHandler implements IQueryHandler<GetInventoryQuery> {
  private readonly cacheTtl = 1800;
  private readonly logger = new Logger(GetInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly cacheAdapter: RedisCacheAdapter,
  ) {}

  async execute(query: GetInventoryQuery): Promise<InventoryDto> {
    const { productId, warehouseId } = query;

    try {
      const cacheKey = warehouseId
        ? `inventory:${productId}:${warehouseId}`
        : `inventory:${productId}:all`;

      const cachedInventory = await this.cacheAdapter.get<
        InventoryItem | InventoryItem[]
      >(cacheKey);
      if (cachedInventory) {
        this.logger.debug(`Cache hit for inventory ${cacheKey}`);
        const inventoryDto: InventoryDto = Array.isArray(cachedInventory)
          ? {
              productId: productId,
              warehouseId: warehouseId || 0,
              quantity: cachedInventory.reduce(
                (sum, item) => sum + item.quantity,
                0,
              ),
              lastUpdated: new Date(),
            }
          : {
              productId: cachedInventory.productId,
              warehouseId: Number(cachedInventory.warehouseId),
              quantity: cachedInventory.quantity,
              lastUpdated: new Date(cachedInventory.lastUpdated),
            };
        return inventoryDto;
      }

      this.logger.debug(
        `Cache miss for inventory ${cacheKey}, fetching from database`,
      );

      const inventory = await this.inventoryRepository.getInventory(
        productId,
        warehouseId,
      );

      const result =
        warehouseId && inventory.length === 1 ? inventory[0] : inventory;

      const inventoryDto: InventoryDto = Array.isArray(result)
        ? {
            productId: productId,
            warehouseId: warehouseId || 0,
            quantity: result.reduce((sum, item) => sum + item.quantity, 0),
            lastUpdated: new Date(),
          }
        : {
            productId: result.productId,
            warehouseId: result.warehouseId,
            quantity: result.quantity,
            lastUpdated: result.lastUpdated,
          };

      await this.cacheAdapter.set(cacheKey, inventoryDto, this.cacheTtl);

      return inventoryDto;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error getting inventory for product ${productId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
