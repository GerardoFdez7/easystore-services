import { Cart } from '../../../aggregates/entities/cart.entity';
import { CartItem } from '../../../aggregates/value-objects/cart-item.vo';
import { CartDTO, CartItemDTO } from './cart.dto';
import { VariantDetailsDTO } from '@shared/dtos';

export class CartMapper {
  static toDto(cart: Cart, variantDetails: VariantDetailsDTO[] = []): CartDTO {
    const cartItems = Array.from(cart.get('cartItems').values()).map((item) =>
      CartMapper.cartItemToDto(item, variantDetails),
    );

    const totalCart = cartItems.reduce((sum, item) => sum + item.subTotal, 0);

    return cart.toDTO<CartDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      customerId: entity.get('customerId')?.getValue(),
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
        unitPrice: 0, // Default values when variant details not available
        productName: '',
        subTotal: 0,
        firstAttribute: { key: '', value: '' },
      };
    }

    const unitPrice = variant.price;
    const productName = variant.productName;
    const subTotal = unitPrice * qty;

    return {
      id: cartItem.getId().getValue(),
      variantId,
      qty,
      promotionId: cartItem.getPromotionId()?.getValue() || null,
      updatedAt: cartItem.getUpdatedAt(),
      unitPrice,
      productName,
      subTotal,
      firstAttribute: variant.firstAttribute,
    };
  }
}
