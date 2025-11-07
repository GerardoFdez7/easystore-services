import { Customer } from '../../entities';
import { CustomerReviewProduct } from '../../value-objects/customer-review-product.vo';

export class CustomerReviewProductDeletedEvent {
  constructor(
    public readonly review: CustomerReviewProduct,
    public readonly customer: Customer,
  ) {}
}
