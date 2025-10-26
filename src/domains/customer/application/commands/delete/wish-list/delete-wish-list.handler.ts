import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteWishListDto } from './delete-wish-list.dto';
import { IWishListRepository } from 'src/domains/customer/aggregates/repositories/wish-list.interface';
import { ICustomerRepository } from 'src/domains/customer/aggregates/repositories/customer.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { Id } from '@shared/value-objects';

@CommandHandler(DeleteWishListDto)
export class DeleteWishListHandler
  implements ICommandHandler<DeleteWishListDto>
{
  constructor(
    @Inject('IWishListRepository')
    private readonly wishListRepository: IWishListRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteWishListDto): Promise<void> {
    const customerId = Id.create(command.customerId);
    const variantId = Id.create(command.variantId);
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

    // Remove the variant from wishlist using repository method
    await this.wishListRepository.removeVariantFromWishList(
      customerId,
      variantId,
    );

    // Merge the customer with events context and commit events
    const customerWithEvents =
      this.eventPublisher.mergeObjectContext(customerFound);
    customerWithEvents.commit();
  }
}
