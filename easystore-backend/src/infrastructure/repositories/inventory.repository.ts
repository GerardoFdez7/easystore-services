import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Logger } from '@nestjs/common';

export interface InventoryItem {
  productId: string;
  warehouseId: number;
  quantity: number;
  lastUpdated: Date;
  updatedById?: number;
}

@Injectable()
export class InventoryRepository {
  private readonly logger = new Logger(InventoryRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async getInventory(
    productId: string,
    warehouseId?: number,
  ): Promise<InventoryItem[]> {
    try {
      if (warehouseId) {
        return Promise.resolve([
          {
            productId,
            warehouseId,
            quantity: 100,
            lastUpdated: new Date(),
          },
        ]);
      } else {
        return Promise.resolve([
          {
            productId,
            warehouseId: 1,
            quantity: 50,
            lastUpdated: new Date(),
          },
          {
            productId,
            warehouseId: 2,
            quantity: 25,
            lastUpdated: new Date(),
          },
          {
            productId,
            warehouseId: 3,
            quantity: 75,
            lastUpdated: new Date(),
          },
        ]);
      }

      // TODO: Implement logic to fetch inventory from the database
      /*
      const query = {
        where: {
          productId,
          ...(warehouseId ? { warehouseId } : {})
        }
      };
      
      const inventoryRecords = await this.prisma.warehouse.findMany(query);
      
      return inventoryRecords.map(record => ({
        productId: record.productId,
        warehouseId: record.warehouseId,
        quantity: record.quantity,
        lastUpdated: record.updatedAt,
        updatedById: record.updatedById
      }));
      */
    } catch (error) {
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

  async updateInventory(
    productId: string,
    warehouseId: number,
    quantity: number,
    reason: string,
    updatedById: number,
  ): Promise<InventoryItem> {
    try {
      const updatedInventory = {
        productId,
        warehouseId,
        quantity,
        lastUpdated: new Date(),
        updatedById,
      };

      // TODO: Implement logic to update inventory in the database
      /*
      return await this.prisma.$transaction(async (prisma) => {
        const currentInventory = await prisma.warehouse.findFirst({
          where: {
            productId,
            warehouseId
          }
        });
        
        if (!currentInventory) {
          throw new Error(`Inventory not found for product ${productId} in warehouse ${warehouseId}`);
        }
        
        const deltaQty = quantity - currentInventory.quantity;
        
        const updatedInventory = await prisma.warehouse.update({
          where: {
            id: currentInventory.id
          },
          data: {
            quantity,
            updatedAt: new Date(),
            updatedById
          }
        });
        
        await prisma.stockMovement.create({
          data: {
            productId,
            warehouseId,
            deltaQty,
            reason: Buffer.from(reason),
            createdById: updatedById,
            ocurredAt: new Date()
          }
        });
        
        return {
          productId: updatedInventory.productId,
          warehouseId: updatedInventory.warehouseId,
          quantity: updatedInventory.quantity,
          lastUpdated: updatedInventory.updatedAt,
          updatedById: updatedInventory.updatedById
        };
      });
      */

      return Promise.resolve(updatedInventory);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error updating inventory for product ${productId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async getTotalInventory(productId: string): Promise<number> {
    try {
      const inventoryItems = await this.getInventory(productId);

      return inventoryItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error getting total inventory for product ${productId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async hasEnoughInventory(
    productId: string,
    requiredQuantity: number,
  ): Promise<boolean> {
    try {
      const totalInventory = await this.getTotalInventory(productId);
      return totalInventory >= requiredQuantity;
    } catch (error) {
      this.logger.error(
        `Error checking inventory for product ${productId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
