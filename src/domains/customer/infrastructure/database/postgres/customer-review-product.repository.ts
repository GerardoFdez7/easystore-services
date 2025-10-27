import { DatabaseOperationError } from '@shared/errors';
import { ICustomerReviewProductRepository } from 'src/domains/customer/aggregates/repositories/customer-review-product.interface';
import { CustomerReviewProduct } from 'src/domains/customer/aggregates/value-objects/customer-review-product.vo';

export class CustomerReviewProductRepository
  implements ICustomerReviewProductRepository
{
  create(review: CustomerReviewProduct): Promise<CustomerReviewProduct> {
    throw new Error('Method not implemented.');
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
