import { Entity, EntityProps } from '@shared/entity.base';
import { Id } from '@shared/value-objects';
import { CartItem } from '../value-objects';
import { ICartBaseType } from './cart.attributes';
import { CartCreatedEvent } from '../events';
import { AddItemToCartEvent } from '../events/add-item-to-cart.event';
import { ItemRemovedFromCartEvent } from '../events/remove-item-cart.event';

export interface ICartProps extends EntityProps {
  id: Id;
  customerId: Id;
  cartItems: Map<string, CartItem>;
}

export class Cart extends Entity<ICartProps> {
  private constructor(props: ICartProps) {
    super(props);
  }

  static reconstitute(props: ICartProps): Cart {
    return new Cart(props);
  }

  static create(input: ICartBaseType): Cart {
    const customerId = Id.create(input.customerId);
    const cart = new Cart({
      id: Id.generate(),
      customerId: customerId,
      cartItems: new Map<string, CartItem>(),
    });

    // Apply domain event
    cart.apply(new CartCreatedEvent(cart));

    return cart;
  }

  static addItemToCart(cart: Cart, item: CartItem): Cart {
    const variantId = item.getVariantIdValue();
    const itemExist = cart.props.cartItems.get(variantId);

    if (!itemExist) {
      // Add item to cart
      cart.props.cartItems.set(variantId, item);
    } else {
      const newQty = itemExist.getQty().getValue() + item.getQty().getValue();

      // Create updated item
      const cartItemUpdated = CartItem.create({
        qty: newQty,
        variantId: variantId,
        promotionId: item.getPromotionId()?.getValue() || null,
      });

      // Set updated item
      cart.props.cartItems.set(variantId, cartItemUpdated);
    }

    cart.apply(new AddItemToCartEvent(cart));

    return cart;
  }

  static removeItem(cart: Cart, idVariant: Id): Cart {
    // Create a new Map to maintain immutability
    const cartItems = new Map(cart.props.cartItems);

    // Check if item exists before removing
    if (!cartItems.has(idVariant.getValue())) {
      throw new Error('Item not found in cart');
    }

    // Delete specific variant
    cartItems.delete(idVariant.getValue());

    // Create updated cart with new props
    const cartUpdated = new Cart({
      id: cart.props.id,
      customerId: cart.props.customerId,
      cartItems: cartItems,
    });

    // Apply domain event
    cartUpdated.apply(new ItemRemovedFromCartEvent(cartUpdated));

    return cartUpdated;
  }
}
