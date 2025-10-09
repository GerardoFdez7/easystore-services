import { Entity, EntityProps } from '@shared/entity.base';
import { Id } from '@shared/value-objects';
import { CartItem, Qty } from '../value-objects';
import { ICartBaseType } from './cart.attributes';
import {
  CartCreatedEvent,
  AddItemToCartEvent,
  ItemRemovedFromCartEvent,
  ItemQuantityUpdatedEvent,
  RemoveManyItemsFromCart,
} from '../events';

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

    if (itemExist) throw new Error('Item already exists in cart.');

    // Create a new map to maintain inmutability
    const cartItems = new Map(cart.props.cartItems);
    cartItems.set(variantId, item);

    const cartUpdated = new Cart({
      id: cart.props.id,
      customerId: cart.props.customerId,
      cartItems,
    });

    cartUpdated.apply(new AddItemToCartEvent(cartUpdated));

    return cartUpdated;
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

  static updateItemQuantity(cart: Cart, variantId: Id, qty: Qty): Cart {
    // Create a new Map to maintain immutability
    const cartItems = new Map(cart.props.cartItems);

    // Get cart item
    const cartItem = cartItems.get(variantId.getValue());

    if (!cartItem) throw new Error('Item not found in cart');
    // Update item
    const itemUpdated = CartItem.create({
      qty: qty.getValue(),
      variantId: variantId.getValue(),
      promotionId: cartItem.getPromotionId()?.getValue() || null,
    });

    cartItems.set(variantId.getValue(), itemUpdated);

    // Create cart updated
    const cartUpdated = new Cart({
      id: cart.props.id,
      customerId: cart.props.customerId,
      cartItems,
    });

    cartUpdated.apply(new ItemQuantityUpdatedEvent(cartUpdated));

    return cartUpdated;
  }

  static removeManyItems(cart: Cart, variantsIds: Id[]): Cart {
    // Create a new Map to maintain immutability
    const cartItems = new Map(cart.props.cartItems);

    // Deleting items
    variantsIds.forEach((variantId) => {
      cartItems.delete(variantId.getValue());
    });

    // Creating update cart
    const cartUpdated = new Cart({
      id: cart.props.id,
      customerId: cart.props.customerId,
      cartItems,
    });

    cartUpdated.apply(new RemoveManyItemsFromCart(cartUpdated));

    return cartUpdated;
  }
}
