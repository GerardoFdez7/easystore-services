import { BadRequestException } from '@nestjs/common';
import { Money } from '@shared/aggregates/value-objects';
import { Cart } from '../../../aggregates/entities/cart/cart.entity';
import { CartItem } from '../../../aggregates/value-objects/cart-item.vo';
import { CartDTO, CartItemDTO } from './cart.dto';
import { VariantDetailsDTO } from '@shared/application/dtos';

/**
 * Maps Cart aggregates to application DTOs enriched with product variant data.
 */
export class CartMapper {
  static toDto(cart: Cart, variantDetails: VariantDetailsDTO[] = []): CartDTO {
    const cartItems = Array.from(cart.get('cartItems').values()).map((item) =>
      CartMapper.cartItemToDto(item, variantDetails),
    );

    const currencies = new Set(
      cartItems
        .filter((item) => Money.compareAmounts(item.subTotal, '0') > 0)
        .map((item) => item.currency),
    );
    if (currencies.size > 1) {
      throw new BadRequestException(
        `Cart contains items priced in mismatched currencies: ${[...currencies].join(', ')}`,
      );
    }

    const totalCart = cartItems.reduce(
      (sum, item) => Money.addAmounts(sum, item.subTotal),
      '0',
    );

    return cart.toDTO<CartDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      customerId: entity.get('customerId')?.getValue(),
      tenantId: entity.get('tenantId')?.getValue(),
      cartItems,
      totalCart,
    }));
  }

  private static cartItemToDto(
    cartItem: CartItem,
    variantDetails: VariantDetailsDTO[] = [],
  ): CartItemDTO {
    const variantId = cartItem.getVariantId().getValue();
    const qty = cartItem.getQty().getValue();

    // Find variant details for this cart item
    const variant = variantDetails.find((v) => v.variantId === variantId);

    // If variant details are not provided, return basic cart item info
    if (!variant) {
      return {
        id: cartItem.getId().getValue(),
        variantId,
        qty,
        promotionId: cartItem.getPromotionId()?.getValue() || null,
        updatedAt: cartItem.getUpdatedAt(),
        unitPrice: '0', // Default values when variant details not available
        currency: '',
        productName: '',
        subTotal: '0',
        firstAttribute: { key: '', value: '' },
      };
    }

    const unitPrice = Money.normalizeAmount(variant.price);
    const currency = variant.currency;
    const productName = variant.productName;
    const subTotal = Money.multiplyAmount(unitPrice, qty);

    return {
      id: cartItem.getId().getValue(),
      variantId,
      qty,
      promotionId: cartItem.getPromotionId()?.getValue() || null,
      updatedAt: cartItem.getUpdatedAt(),
      unitPrice,
      currency,
      productName,
      subTotal,
      firstAttribute: variant.firstAttribute,
    };
  }
}
