import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCustomerReviewProductDto } from './update-customer-review-product.dto';
import { CustomerReviewProductDTO } from '../../../mappers/review/customer-review-product.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICustomerRepository } from '../../../../aggregates/repositories/customer.interface';
import { ICustomerReviewProductRepository } from '../../../../aggregates/repositories/customer-review-product.interface';
import { Id } from '@shared/value-objects';
import { Customer } from '../../../../aggregates/entities';
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
    const customerFound = await this.customerRepository.findById(
      customerId,
      tenantId,
    );

    if (!customerFound) {
      throw new NotFoundException(
        `Customer with id ${command.customerId} not found`,
      );
    }

    // Search review
    const existingReview = await this.reviewRepository.findById(
      reviewId,
      tenantId,
    );

    if (!existingReview) {
      throw new NotFoundException(
        `Review with id ${command.review.id} not found`,
      );
    }

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
