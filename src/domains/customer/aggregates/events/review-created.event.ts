import { Customer } from '../entities';
import { CustomerReviewProduct } from '../value-objects/customer-review-product.vo';

export class CustomerReviewProductCreatedEvent {
  constructor(
    public readonly review: CustomerReviewProduct,
    public readonly customer: Customer,
  ) {}
}
