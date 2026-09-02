import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { Id } from '@shared/aggregates/value-objects';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { ICustomerReviewProductRepository } from '../../aggregates/repositories';
import { CustomerReviewProduct } from '../../aggregates/value-objects';
import { CustomerReviewProductMapper } from '../../application/mappers';

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

      const createdReview = await this.postgresService.$transaction(
        async (tx) =>
          tx.customerReviewProduct.create({
            data: {
              id: reviewData.id,
              ratingCount: reviewData.ratingCount,
              comment: reviewData.comment,
              customerId: reviewData.customerId,
              variantId: reviewData.variantId,
              tenantId: reviewData.tenantId,
              updatedAt: reviewData.updatedAt,
            },
          }),
      );

      return CustomerReviewProductMapper.fromPersistence(createdReview);
    } catch (error) {
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

      const updatedReview = await this.postgresService.$transaction(
        async (tx) =>
          tx.customerReviewProduct.update({
            where: {
              id: reviewId,
              customerId: reviewData.customerId,
              tenantId: reviewData.tenantId,
            },
            data: {
              ratingCount: reviewData.ratingCount,
              comment: reviewData.comment,
              updatedAt: reviewData.updatedAt,
            },
          }),
      );

      return CustomerReviewProductMapper.fromPersistence(updatedReview);
    } catch (error) {
      return this.handleDatabaseError(error, 'update customer review product');
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
    tenantId: Id,
  ): Promise<CustomerReviewProduct | null> {
    const idValue = id.getValue();
    const customerIdValue = customerId.getValue();
    const tenantIdValue = tenantId.getValue();

    try {
      const reviewProduct =
        await this.postgresService.customerReviewProduct.findUnique({
          where: {
            id: idValue,
            customerId: customerIdValue,
            tenantId: tenantIdValue,
          },
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
   * Finds multiple customer review products by customer ID and optional review IDs.
   * @param customerId The unique identifier of the customer.
   * @param reviewIds Optional array of review IDs to filter by.
   * @returns Promise that resolves to an array of CustomerReviewProduct entities.
   */
  async findMany(
    customerId: Id,
    reviewIds: Id[],
    tenantId: Id,
  ): Promise<CustomerReviewProduct[]> {
    const customerIdValue = customerId.getValue();

    try {
      const whereClause: Prisma.CustomerReviewProductWhereInput = {
        customerId: customerIdValue,
        tenantId: tenantId.getValue(),
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
      return this.handleDatabaseError(
        error,
        'find many customer review products',
      );
    }
  }

  /**
   * Removes a customer review product by customer ID and review ID.
   * @param customerId The unique identifier of the customer.
   * @param reviewId The unique identifier of the review product.
   * @returns Promise that resolves when the review is successfully removed.
   */
  async removeReview(
    customerId: Id,
    reviewId: Id,
    tenantId: Id,
  ): Promise<void> {
    const customerIdValue = customerId.getValue();
    const reviewIdValue = reviewId.getValue();

    try {
      await this.postgresService.$transaction(async (tx) => {
        await tx.customerReviewProduct.delete({
          where: {
            id: reviewIdValue,
            customerId: customerIdValue,
            tenantId: tenantId.getValue(),
          },
        });
      });
    } catch (error) {
      return this.handleDatabaseError(error, 'remove customer review product');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Customer Review Product',
      foreignKeyEntities: {
        customerId: 'Customer',
        variantId: 'Variant',
      },
    });
  }
}
