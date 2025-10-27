import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateCustomerReviewProductDto } from './create-customer-review-product.dto';
import { CustomerReviewProductDTO } from '../../../mappers/review/customer-review-product.dto';
import { ICustomerRepository } from 'src/domains/customer/aggregates/repositories/customer.interface';
import { Inject } from '@nestjs/common';
import { ICustomerReviewProductRepository } from 'src/domains/customer/aggregates/repositories/customer-review-product.interface';
import { Id } from '@shared/value-objects';
import { Customer } from 'src/domains/customer/aggregates/entities';
import { CustomerReviewProductMapper } from '../../../mappers/review/customer-review-product.mapper';

@CommandHandler(CreateCustomerReviewProductDto)
export class CreateCustomerReviewProductHandler
  implements ICommandHandler<CreateCustomerReviewProductDto>
{
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('ICustomerReviewProductRepository')
    private readonly reviewRepository: ICustomerReviewProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: CreateCustomerReviewProductDto,
  ): Promise<CustomerReviewProductDTO> {
    const customerId = Id.create(command.customerId);
    const tenantIdId = Id.create(command.tenantId);
    const { ratingCount, comment, variantId } = command.review;
    // Find customer
    const customer = await this.customerRepository.findCustomerById(
      customerId,
      tenantIdId,
    );

    // Create review
    const review = Customer.addCustomerReviewProduct(
      {
        ratingCount,
        comment,
        variantId,
      },
      customer,
    );

    // Persist review in DB
    await this.reviewRepository.create(review);

    // Merge the customer with events context and commit events
    const customerWithEvents = this.eventPublisher.mergeObjectContext(customer);
    customerWithEvents.commit();

    return CustomerReviewProductMapper.toDto(review);
  }
}
