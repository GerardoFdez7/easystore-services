import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateInventoryCommand } from '../update-inventory.command';
import { InventoryRepository } from '@repositories/inventory.repository';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { Logger } from '@nestjs/common';
import { ProductUpdatedProducer } from '@transport/kafka/producers/product-updated.producer';
import { ProductUpdatedEvent } from '@domain/events/product-updated.event';

@Injectable()
@CommandHandler(UpdateInventoryCommand)
export class UpdateInventoryHandler
  implements ICommandHandler<UpdateInventoryCommand>
{
  private readonly logger = new Logger(UpdateInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly cacheAdapter: RedisCacheAdapter,
    private readonly productUpdatedProducer: ProductUpdatedProducer,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateInventoryCommand): Promise<unknown> {
    const { productId, warehouseId, quantity, reason, updatedById } = command;

    try {
      this.logger.log(
        `Updating inventory for product ${productId} in warehouse ${warehouseId} to ${quantity}`,
      );

      const updatedInventory = await this.inventoryRepository.updateInventory(
        productId,
        warehouseId,
        quantity,
        reason,
        updatedById,
      );

      await this.cacheAdapter.invalidate(
        `inventory:${productId}:${warehouseId}`,
      );
      await this.cacheAdapter.invalidate(`inventory:${productId}:total`);

      await this.cacheAdapter.invalidate(`product:${productId}`);
      await this.cacheAdapter.invalidatePattern(`products:*`);

      // TODO: Retrieve clientId from the context or command
      const clientId = 1;

      const totalInventory =
        await this.inventoryRepository.getTotalInventory(productId);

      const productUpdatedEvent = new ProductUpdatedEvent(
        productId,
        clientId,
        'default',
        {
          id: productId,
          stock: totalInventory,
          name: 'Producto actualizado',
          description: 'Descripción actualizada por cambio de inventario',
          price: 0,
          categoryId: 'default',
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      );

      await this.productUpdatedProducer.publishProductUpdated(
        productUpdatedEvent,
      );

      this.eventBus.publish(productUpdatedEvent);

      this.logger.log(
        `Inventory updated successfully for product ${productId}`,
      );

      return updatedInventory;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating inventory: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error updating inventory: Unknown error');
      }
      throw error;
    }
  }
}
