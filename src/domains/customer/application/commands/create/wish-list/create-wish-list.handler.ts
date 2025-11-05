import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateWishListDto } from './create-wish-list.dto';
import { IWishListRepository } from 'src/domains/customer/aggregates/repositories/wish-list.interface';
import { BadRequestException, Inject } from '@nestjs/common';
import { ICustomerRepository } from 'src/domains/customer/aggregates/repositories/customer.interface';
import { Id } from '@shared/value-objects';
import { Customer } from 'src/domains/customer/aggregates/entities';
import { WishListDTO, WishListMapper } from '../../../mappers';

@CommandHandler(CreateWishListDto)
export class CreateWishListHandler
  implements ICommandHandler<CreateWishListDto>
{
  constructor(
    @Inject('IWishListRepository')
    private readonly wishListRepository: IWishListRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateWishListDto): Promise<WishListDTO> {
    const customerId = Id.create(command.wishListItem.customerId);
    const tenantId = Id.create(command.tenantId);
    const variantId = Id.create(command.wishListItem.variantId);

    // Find the customer to validate it exists
    const customerFound = await this.customerRepository.findCustomerById(
      customerId,
      tenantId,
    );

    // Check if not exist a wishlist item already
    const wishListItemFound =
      await this.wishListRepository.findWishListItemByVariantId(variantId);

    if (wishListItemFound !== null)
      throw new BadRequestException(
        'This variant already exist in your wishlist!',
      );

    // Create the wishlist item using the domain method
    const wishlistItemCreated = Customer.addVariantToWishList(
      {
        variantId: variantId.getValue(),
        customerId: customerId.getValue(),
      },
      customerFound,
    );

    // Persist the wishlist item
    const persistedWishlistItem =
      await this.wishListRepository.create(wishlistItemCreated);

    // Merge the customer with events context and commit events
    const customerWithEvents =
      this.eventPublisher.mergeObjectContext(customerFound);
    customerWithEvents.commit();

    // Return the DTO
    return WishListMapper.toDto(persistedWishlistItem);
  }
}
