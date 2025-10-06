import { Cart } from '../entities/cart.entity';

export interface ICartRepository {
  create(cart: Cart): Promise<Cart>;
}
