import { CustomerReviewProduct } from '../value-objects/customer-review-product.vo';

export interface ICustomerReviewProductRepository {
  create(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;
  update(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;
}
