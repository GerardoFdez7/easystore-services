import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCustomerReviewProductDto } from './update-customer-review-product.dto';
import { CustomerReviewProductDTO } from '../../../mappers/review/customer-review-product.dto';
import { Inject } from '@nestjs/common';
import { ICustomerRepository } from 'src/domains/customer/aggregates/repositories/customer.interface';
import { ICustomerReviewProductRepository } from 'src/domains/customer/aggregates/repositories/customer-review-product.interface';
import { Id } from '@shared/value-objects';
import { Customer } from 'src/domains/customer/aggregates/entities';
import { CustomerReviewProductMapper } from '../../../mappers/review/customer-review-product.mapper';

@CommandHandler(UpdateCustomerReviewProductDto)
export class UpdateCustomerReviewProductHandler
  implements ICommandHandler<UpdateCustomerReviewProductDto>
{
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('ICustomerReviewProductRepository')
    private readonly reviewRepository: ICustomerReviewProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: UpdateCustomerReviewProductDto,
  ): Promise<CustomerReviewProductDTO> {
    const customerId = Id.create(command.customerId);
    const tenantId = Id.create(command.tenantId);
    const reviewId = Id.create(command.review.id);

    // Search customer
    const customerFound = await this.customerRepository.findCustomerById(
      customerId,
      tenantId,
    );

    // Search review
    const existingReview = await this.reviewRepository.findById(reviewId);

    // Create updated review
    const updatedReview = Customer.updateCustomerReviewProduct(
      existingReview,
      {
        ratingCount: command.review.ratingCount,
        comment: command.review.comment,
      },
      customerFound,
    );

    // Persist review
    await this.reviewRepository.update(updatedReview);

    // Commit event
    // Merge the customer with events context and commit events
    const customerWithEvents =
      this.eventPublisher.mergeObjectContext(customerFound);
    customerWithEvents.commit();

    return CustomerReviewProductMapper.toDto(updatedReview);
  }
}
