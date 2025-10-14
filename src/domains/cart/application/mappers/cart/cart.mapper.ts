import { Cart } from '../../../aggregates/entities/cart.entity';
import { CartItem } from '../../../aggregates/value-objects/cart-item.vo';
import { CartDTO, CartItemDTO } from './cart.dto';
import { VariantDetailsDTO } from '@shared/dtos';

export class CartMapper {
  static toDto(cart: Cart, variantDetails: VariantDetailsDTO[] = []): CartDTO {
    const cartItems = Array.from(cart.get('cartItems').values()).map((item) =>
      CartMapper.cartItemToDto(item, variantDetails),
    );

    const total = cartItems.reduce((sum, item) => sum + item.subTotal, 0);

    return cart.toDTO<CartDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      customerId: entity.get('customerId')?.getValue(),
      cartItems,
      total,
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
    const unitPrice = variant?.price || 0;
    const name = variant?.productName || '';
    const subTotal = unitPrice * qty;

    return {
      id: cartItem.getId().getValue(),
      variantId,
      qty,
      promotionId: cartItem.getPromotionId()?.getValue() || null,
      updatedAt: cartItem.getUpdatedAt(),
      unitPrice,
      name,
      subTotal,
    };
  }
}
