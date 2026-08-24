import { IEvent } from '@nestjs/cqrs';
import { Customer } from '../../entities';
import { CustomerReviewProduct } from '../../value-objects/customer-review-product.vo';

export class CustomerReviewProductDeletedEvent implements IEvent {
  constructor(
    public readonly review: CustomerReviewProduct,
    public readonly customer: Customer,
  ) {}
}
