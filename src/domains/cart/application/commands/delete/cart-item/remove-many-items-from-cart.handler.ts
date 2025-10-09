import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveManyItemsFromCartDto } from './remove-many-items-from-cart.dto';
import { CartDTO, CartMapper } from '../../../mappers';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from 'src/domains/cart/aggregates/repositories/cart.interface';
import { Id } from '@shared/value-objects';
import { Cart } from 'src/domains/cart/aggregates/entities/cart.entity';

@CommandHandler(RemoveManyItemsFromCartDto)
export class RemoveManyItemsFromCartHandler
  implements ICommandHandler<RemoveManyItemsFromCartDto>
{
  constructor(
    // Inject the cart repository to handle cart persistence operations
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    // Event publisher for handling domain events after cart modifications
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

    // Transform the array of variant ID strings into Id value objects
    // This ensures type safety and follows domain-driven design principles
    const variantsIdList = command.data.variantIds.map((variantId) => {
      return Id.create(variantId);
    });

    // Apply the domain logic to remove multiple items from the cart
    // The eventPublisher.mergeObjectContext enables automatic event publishing
    // when the cart entity applies domain events
    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.removeManyItems(cartFound, variantsIdList),
    );

    // Persist the updated cart to the database
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    cartWithEvents.commit();

    // Convert the domain entity to a DTO for the response
    // This ensures proper data encapsulation and API contract compliance
    return CartMapper.toDto(cartUpdated);
  }
}
