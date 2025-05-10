/* eslint-disable */
import { ScheduleDeleteProductsJob } from '@domains/product/infrastructure/jobs/schedule-delete.job';
import { Product } from '@domains/product/aggregates/entities/product.entity';
import { IProductRepository } from '@domains/product/aggregates/repositories/product.interface';

describe('ScheduleDeleteProductsJob', () => {
  let job: ScheduleDeleteProductsJob;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      hardDelete: jest.fn(),
      // ...other methods if needed
    } as any;

    job = new ScheduleDeleteProductsJob(productRepository);
  });

  it('should hard delete products scheduled for deletion', async () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 1000 * 60 * 60 * 24); // 1 day ago
    const futureDate = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 1 day ahead

    // Mock products
    const products = [
      {
        get: (field: string) => {
          if (field === 'metadata') {
            return {
              getDeleted: () => true,
              getScheduledForHardDeleteAt: () => pastDate,
            };
          }
          if (field === 'id') {
            return { getValue: () => '1' };
          }
        },
      },
      {
        get: (field: string) => {
          if (field === 'metadata') {
            return {
              getDeleted: () => true,
              getScheduledForHardDeleteAt: () => futureDate,
            };
          }
          if (field === 'id') {
            return { getValue: () => '2' };
          }
        },
      },
      {
        get: (field: string) => {
          if (field === 'metadata') {
            return {
              getDeleted: () => false,
              getScheduledForHardDeleteAt: () => pastDate,
            };
          }
          if (field === 'id') {
            return { getValue: () => '3' };
          }
        },
      },
    ] as unknown as Product[];

    productRepository.findAll.mockResolvedValue({
      products,
      total: products.length,
    });

    await job.handleScheduledDeletions();

    // Only the first product should be hard deleted
    expect(productRepository.hardDelete).toHaveBeenCalledTimes(1);
    expect(productRepository.hardDelete).toHaveBeenCalledWith({
      getValue: () => '1',
    });
  });
});
