import { IEvent } from '@nestjs/cqrs';
import { Customer } from '../../entities';
import { CustomerReviewProduct } from '../../value-objects/customer-review-product.vo';

export class CustomerReviewProductUpdatedEvent implements IEvent {
  constructor(
    public readonly review: CustomerReviewProduct,
    public readonly customer: Customer,
  ) {}
}
