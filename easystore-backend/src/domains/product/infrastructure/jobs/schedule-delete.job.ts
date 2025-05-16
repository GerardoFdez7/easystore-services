import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@winston/winston.service';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../aggregates/repositories/product.interface';

@Injectable()
export class ScheduleDeleteProductsJob {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Cron job that runs every day at 3:00 AM to check for products
   * that have been soft-deleted and are scheduled for hard deletion
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledDeletions(): Promise<void> {
    this.logger.log('Starting scheduled product hard deletion job');

    try {
      let page = 1;
      const pageSize = 100;
      let hasMoreProducts = true;
      let totalDeleted = 0;

      // Process products in batches using pagination
      while (hasMoreProducts) {
        // Get a batch of soft-deleted products
        const { products, total } = await this.productRepository.findAll(
          page,
          pageSize,
          undefined,
          true,
        );

        // Filter products that are scheduled for hard deletion and the time has passed
        const now = new Date();
        const productsToDelete = products.filter((product) => {
          const metadata = product.get('metadata');
          if (!metadata) return false;

          const isDeleted = metadata.getDeleted();
          const scheduledDate = metadata.getScheduledForHardDeleteAt();

          return isDeleted && scheduledDate && scheduledDate <= now;
        });

        this.logger.log(
          `Found ${productsToDelete.length} products to hard delete in page ${page}`,
        );

        // Process each product for hard deletion
        for (const product of productsToDelete) {
          const productId = product.get('id');
          try {
            await this.productRepository.hardDelete(productId);
            totalDeleted++;
            this.logger.log(
              `Successfully hard deleted product with ID: ${productId.getValue()}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to hard delete product with ID: ${productId.getValue()}`,
              error,
            );
          }
        }

        // Check if we need to fetch more products
        const totalPages = Math.ceil(total / pageSize);
        if (page >= totalPages || products.length === 0) {
          hasMoreProducts = false;
        } else {
          page++;
        }
      }

      this.logger.log(
        `Scheduled product hard deletion job completed. Total products deleted: ${totalDeleted}`,
      );
    } catch (error) {
      this.logger.error('Error in scheduled product hard deletion job', error);
    }
  }
}
