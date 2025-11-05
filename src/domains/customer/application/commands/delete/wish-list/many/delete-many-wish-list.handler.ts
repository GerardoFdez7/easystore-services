import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteManyWishListDto } from './delete-many-wish-list.dto';
import { IWishListRepository } from '../../../../../aggregates/repositories/wish-list.interface';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { Customer } from '../../../../../aggregates/entities';

@CommandHandler(DeleteManyWishListDto)
export class DeleteManyWishListHandler
  implements ICommandHandler<DeleteManyWishListDto>
{
  constructor(
    @Inject('IWishListRepository')
    private readonly wishListRepository: IWishListRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteManyWishListDto): Promise<void> {
    const customerId = Id.create(command.customerId);
    const variantIds = command.variantIds.map((id) => Id.create(id));
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

    // Remove multiple variants from wishlist using repository method and get the deleted items
    const deletedWishListItems =
      await this.wishListRepository.removeManyFromWishList(
        customerId,
        variantIds,
      );

    // Use the domain method to emit the event with the actual deleted items
    Customer.removeManyVariantsFromWishList(
      deletedWishListItems,
      customerFound,
    );

    // Merge the customer with events context and commit events
    const customerWithEvents =
      this.eventPublisher.mergeObjectContext(customerFound);
    customerWithEvents.commit();
  }
}
