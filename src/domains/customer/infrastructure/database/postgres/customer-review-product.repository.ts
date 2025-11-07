import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { DatabaseOperationError } from '@shared/errors';
import { Id } from '@shared/value-objects';
import { ICustomerReviewProductRepository } from '../../../aggregates/repositories/customer-review-product.interface';
import { CustomerReviewProduct } from '../../../aggregates/value-objects';
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

      this.handleDatabaseError(error, 'create customer review product');
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

      this.handleDatabaseError(error, 'update customer review product');
    }
  }

  /**
   * Finds a customer review product by its unique identifier.
   * @param id The unique identifier of the customer review product.
   * @returns Promise that resolves to the CustomerReviewProduct if found, null otherwise.
   */
  async findById(
    id: Id,
    customerId: Id,
  ): Promise<CustomerReviewProduct | null> {
    const idValue = id.getValue();
    const customerIdValue = customerId.getValue();

    try {
      const reviewProduct =
        await this.postgresService.customerReviewProduct.findUnique({
          where: { id: idValue, customerId: customerIdValue },
        });

      return reviewProduct
        ? CustomerReviewProductMapper.fromPersistence(reviewProduct)
        : null;
    } catch (error) {
      this.handleDatabaseError(error, 'find customer review product by id');
    }
  }

  /**
   * Finds multiple customer review products by customer ID and optional review IDs.
   * @param customerId The unique identifier of the customer.
   * @param reviewIds Optional array of review IDs to filter by.
   * @returns Promise that resolves to an array of CustomerReviewProduct entities.
   */
  async findMany(
    customerId: Id,
    reviewIds: Id[],
  ): Promise<CustomerReviewProduct[]> {
    const customerIdValue = customerId.getValue();

    try {
      const whereClause: Prisma.CustomerReviewProductWhereInput = {
        customerId: customerIdValue,
      };

      // If reviewIds are provided, add them to the where clause
      if (reviewIds && reviewIds.length > 0) {
        whereClause.id = {
          in: reviewIds.map((id) => id.getValue()),
        };
      }

      const reviewProducts =
        await this.postgresService.customerReviewProduct.findMany({
          where: whereClause,
          orderBy: {
            updatedAt: 'desc',
          },
        });

      return reviewProducts.map((reviewProduct) =>
        CustomerReviewProductMapper.fromPersistence(reviewProduct),
      );
    } catch (error) {
      this.handleDatabaseError(error, 'find many customer review products');
    }
  }

  /**
   * Removes a customer review product by customer ID and review ID.
   * @param customerId The unique identifier of the customer.
   * @param reviewId The unique identifier of the review product.
   * @returns Promise that resolves when the review is successfully removed.
   */
  async removeReview(customerId: Id, reviewId: Id): Promise<void> {
    const customerIdValue = customerId.getValue();
    const reviewIdValue = reviewId.getValue();

    try {
      await this.postgresService.customerReviewProduct.delete({
        where: {
          id: reviewIdValue,
          customerId: customerIdValue,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle record not found error
        if (error.code === 'P2025') {
          throw new DatabaseOperationError(
            'remove customer review product',
            'Customer review product not found or does not belong to the specified customer',
            error,
          );
        }
      }

      this.handleDatabaseError(error, 'remove customer review product');
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
