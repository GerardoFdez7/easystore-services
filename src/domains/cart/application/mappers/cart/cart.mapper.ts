import { Cart } from '../../../aggregates/entities/cart.entity';
import { CartItem } from '../../../aggregates/value-objects/cart-item.vo';
import { CartDTO, CartItemDTO } from './cart.dto';

export class CartMapper {
  static toDto(cart: Cart): CartDTO {
    return cart.toDTO<CartDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      customerId: entity.get('customerId')?.getValue(),
      cartItems: Array.from(entity.get('cartItems').values()).map((item) =>
        CartMapper.cartItemToDto(item),
      ),
    }));
  }

  private static cartItemToDto(cartItem: CartItem): CartItemDTO {
    return {
      id: cartItem.getId().getValue(),
      variantId: cartItem.getVariantId().getValue(),
      qty: cartItem.getQty().getValue(),
      promotionId: cartItem.getPromotionId()?.getValue() || null,
      updatedAt: cartItem.getUpdatedAt(),
    };
  }
}
