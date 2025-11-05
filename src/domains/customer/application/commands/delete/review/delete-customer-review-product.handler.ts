import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCustomerReviewProductDto } from './delete-customer-review-product.dto';
import { ICustomerReviewProductRepository } from '../../../../aggregates/repositories/customer-review-product.interface';
import { ICustomerRepository } from '../../../../aggregates/repositories/customer.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { Customer } from '../../../../aggregates/entities';

@CommandHandler(DeleteCustomerReviewProductDto)
export class DeleteCustomerReviewProductHandler
  implements ICommandHandler<DeleteCustomerReviewProductDto>
{
  constructor(
    @Inject('ICustomerReviewProductRepository')
    private readonly reviewRepository: ICustomerReviewProductRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteCustomerReviewProductDto): Promise<void> {
    const customerId = Id.create(command.customerId);
    const reviewId = Id.create(command.reviewId);
    const tenantId = Id.create(command.tenantId);

    // Find the customer to validate it exists
    const customerFound = await this.customerRepository.findCustomerById(
      customerId,
      tenantId,
    );

    if (!customerFound) {
      throw new NotFoundException(
        `Customer with ID ${command.customerId} not found`,
      );
    }

    // Find the review to validate it exists and belongs to the customer
    const reviewFound = await this.reviewRepository.findById(reviewId);

    if (!reviewFound) {
      throw new NotFoundException(
        `Review with ID ${command.reviewId} not found`,
      );
    }

    // Validate that the review belongs to the customer
    if (reviewFound.getCustomerIdValue() !== command.customerId) {
      throw new NotFoundException(
        `Review with ID ${command.reviewId} does not belong to customer ${command.customerId}`,
      );
    }

    // Use the domain method to emit the event
    Customer.removeCustomerReviewProduct(reviewFound, customerFound);

    // Merge the customer with events context and commit events
    const customerWithEvents =
      this.eventPublisher.mergeObjectContext(customerFound);
    customerWithEvents.commit();

    // Remove the review using repository method
    await this.reviewRepository.removeReview(customerId, reviewId);
  }
}
