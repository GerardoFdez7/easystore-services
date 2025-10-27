import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { DatabaseOperationError } from '@shared/errors';
import { Id } from '@shared/value-objects';
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
   * Updates an existing customer review product in the repository.
   * @param review The customer review product entity to update.
   * @returns Promise that resolves to the updated CustomerReviewProduct entity.
   */
  async update(review: CustomerReviewProduct): Promise<CustomerReviewProduct> {
    try {
      const reviewData = CustomerReviewProductMapper.toPersistence(review);
      const reviewId = review.getIdValue();

      const updatedReview =
        await this.postgresService.customerReviewProduct.update({
          where: { id: reviewId },
          data: {
            ratingCount: reviewData.ratingCount,
            comment: reviewData.comment,
            updatedAt: reviewData.updatedAt,
          },
        });

      return CustomerReviewProductMapper.fromPersistence(updatedReview);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle record not found error
        if (error.code === 'P2025') {
          throw new DatabaseOperationError(
            'update customer review product',
            'Customer review product not found',
            error,
          );
        }
        // Handle foreign key constraint violations
        if (error.code === 'P2003') {
          throw new DatabaseOperationError(
            'update customer review product',
            'Referenced customer or variant does not exist',
            error,
          );
        }
      }

      return this.handleDatabaseError(error, 'update customer review product');
    }
  }

  /**
   * Finds a customer review product by its unique identifier.
   * @param id The unique identifier of the customer review product.
   * @returns Promise that resolves to the CustomerReviewProduct if found, null otherwise.
   */
  async findById(id: Id): Promise<CustomerReviewProduct | null> {
    const idValue = id.getValue();

    try {
      const reviewProduct =
        await this.postgresService.customerReviewProduct.findUnique({
          where: { id: idValue },
        });

      return reviewProduct
        ? CustomerReviewProductMapper.fromPersistence(reviewProduct)
        : null;
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'find customer review product by id',
      );
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
