import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { DatabaseOperationError } from '@shared/errors';
import { ICustomerReviewProductRepository } from 'src/domains/customer/aggregates/repositories/customer-review-product.interface';
import { CustomerReviewProduct } from 'src/domains/customer/aggregates/value-objects/customer-review-product.vo';
import { CustomerReviewProductMapper } from '../../../application/mappers/review/customer-review-product.mapper';

@Injectable()
export class CustomerReviewProductRepository
  implements ICustomerReviewProductRepository
{
  constructor(private readonly postgresService: PostgreService) {}

  /**
   * Creates a new customer review product in the repository.
   * @param review The customer review product entity to create.
   * @returns Promise that resolves to the created CustomerReviewProduct entity.
   */
  async create(review: CustomerReviewProduct): Promise<CustomerReviewProduct> {
    try {
      const reviewData = CustomerReviewProductMapper.toPersistence(review);

      const createdReview =
        await this.postgresService.customerReviewProduct.create({
          data: {
            id: reviewData.id,
            ratingCount: reviewData.ratingCount,
            comment: reviewData.comment,
            customerId: reviewData.customerId,
            variantId: reviewData.variantId,
            updatedAt: reviewData.updatedAt,
          },
        });

      return CustomerReviewProductMapper.fromPersistence(createdReview);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violations or other known Prisma errors
        if (error.code === 'P2002') {
          throw new DatabaseOperationError(
            'create customer review product',
            'Customer review already exists for this customer and variant',
            error,
          );
        }
        if (error.code === 'P2003') {
          throw new DatabaseOperationError(
            'create customer review product',
            'Referenced customer or variant does not exist',
            error,
          );
        }
      }

      return this.handleDatabaseError(error, 'create customer review product');
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
