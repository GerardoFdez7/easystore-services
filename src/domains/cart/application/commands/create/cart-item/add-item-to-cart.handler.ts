import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddItemToCartDto } from './add-item-to-cart.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { PublicBadRequestException } from '@shared/application/exceptions/public-bad-request.exception';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../../../mappers';
import { Cart } from '../../../../aggregates/entities/cart/cart.entity';
import { CartItem } from '../../../../aggregates/value-objects';
import { IProductAdapter } from '../../../ports';
import { findStoreCartOrThrow } from '../../../shared/cart-command-helpers';

@CommandHandler(AddItemToCartDto)
export class AddItemToCartHandler implements ICommandHandler<AddItemToCartDto> {
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
    @Inject('IProductAdapter')
    private readonly productAdapter: IProductAdapter,
  ) {}

  async execute(command: AddItemToCartDto): Promise<CartDTO> {
    const { variantId, promotionId } = command.data;

    const cartFound = await findStoreCartOrThrow(
      this.cartRepository,
      command.customerId,
      command.storeId,
    );

    const variants = await this.productAdapter.getVariantsDetails(
      [variantId],
      command.storeId,
    );

    if (variants.length !== 1) {
      throw new NotFoundException('Variant not found');
    }

    // A cart has one currency: reject a product priced differently from the items
    // already in it (docs/MONETARY-CONTRACT.md). An empty cart accepts any currency.
    const existingVariantIds = Array.from(cartFound.get('cartItems').keys());
    if (existingVariantIds.length > 0) {
      const cartVariants = await this.productAdapter.getVariantsDetails(
        existingVariantIds,
        command.storeId,
      );
      if (
        cartVariants.some(
          (item) => item.productCurrency !== variants[0].productCurrency,
        )
      ) {
        throw new PublicBadRequestException(
          'This item is priced in a different currency than the items in your cart',
        );
      }
    }

    // Cart Item object
    const cartItem = CartItem.create({
      qty: 1,
      variantId,
      promotionId: promotionId || null,
    });

    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.addItemToCart(cartFound, cartItem),
    );

    // Persist the cart to the repository
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    // Commit domain events
    cartWithEvents.commit();

    return CartMapper.toDto(cartUpdated, variants);
  }
}
