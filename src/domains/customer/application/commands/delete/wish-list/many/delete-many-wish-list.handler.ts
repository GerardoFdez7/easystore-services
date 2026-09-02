import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteManyWishListDto } from './delete-many-wish-list.dto';
import { IWishListRepository } from '../../../../../aggregates/repositories/wish-list.interface';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/aggregates/value-objects';
import { Customer } from '../../../../../aggregates/entities';
import { findCustomerOrThrow } from '../../../../shared/find-customer-or-throw';
import { WishListMultiStatusDTO } from '../../../../mappers/wish-list/wish-list.dto';

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

  async execute(
    command: DeleteManyWishListDto,
  ): Promise<WishListMultiStatusDTO> {
    const customerId = Id.create(command.customerId);
    const variantIds = command.variantIds.map((id) => Id.create(id));
    const tenantId = Id.create(command.tenantId);

    // Find the customer to validate it exists
    const customerFound = await findCustomerOrThrow(
      this.customerRepository,
      customerId,
      tenantId,
    );

    // Remove multiple variants from wishlist using repository method and get the deleted items
    const deletedWishListItems =
      await this.wishListRepository.removeManyFromWishList(
        customerId,
        variantIds,
        tenantId,
      );

    const deletedItemsByVariantId = new Map(
      deletedWishListItems.map((item) => [item.getVariantIdValue(), item]),
    );
    const results = command.variantIds.map((variantId) => {
      const deletedItem = deletedItemsByVariantId.get(variantId);

      deletedItemsByVariantId.delete(variantId);

      return {
        id: deletedItem?.getIdValue() ?? null,
        variantId,
        status: deletedItem ? 200 : 404,
        message: deletedItem ? 'Deleted' : 'Item not found',
      };
    });

    if (deletedWishListItems.length > 0) {
      Customer.removeManyVariantsFromWishList(
        deletedWishListItems,
        customerFound,
      );

      const customerWithEvents =
        this.eventPublisher.mergeObjectContext(customerFound);
      customerWithEvents.commit();
    }

    return {
      summary: {
        total: results.length,
        successful: results.filter((result) => result.status === 200).length,
        failed: results.filter((result) => result.status === 404).length,
      },
      results,
    };
  }
}
