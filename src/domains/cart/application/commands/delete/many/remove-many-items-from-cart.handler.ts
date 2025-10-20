import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveManyItemsFromCartDto } from './remove-many-items-from-cart.dto';
import { CartDTO, CartMapper } from '../../../mappers';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { Id } from '../../../../aggregates/value-objects';
import { Cart } from '../../../../aggregates/entities/cart.entity';

@CommandHandler(RemoveManyItemsFromCartDto)
export class RemoveManyItemsFromCartHandler
  implements ICommandHandler<RemoveManyItemsFromCartDto>
{
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Executes the command to remove multiple items from a cart.
   *
   * @param command - The command containing customerId and array of variantIds to remove
   * @returns Promise<CartDTO> - The updated cart data transfer object
   * @throws NotFoundException - When the cart is not found for the given customer
   */
  async execute(command: RemoveManyItemsFromCartDto): Promise<CartDTO> {
    // Find the customer's cart using their ID
    const cartFound = await this.cartRepository.findCartByCustomerId(
      Id.create(command.customerId),
    );

    // Validate that the cart exists for the customer
    if (!cartFound) throw new NotFoundException('Cart not found');

    const variantsIdList = command.data.variantIds.map((variantId) => {
      return Id.create(variantId);
    });

    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.removeManyItems(cartFound, variantsIdList),
    );

    // Persist the updated cart to the database
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    cartWithEvents.commit();

    // Convert the domain entity to a DTO for the response
    return CartMapper.toDto(cartUpdated);
  }
}
