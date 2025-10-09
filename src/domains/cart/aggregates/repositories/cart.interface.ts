import { Id } from '@shared/value-objects';
import { Cart } from '../entities/cart.entity';

export interface ICartRepository {
  create(cart: Cart): Promise<Cart>;
  update(cart: Cart): Promise<Cart>;
  findCartById(id: Id): Promise<Cart>;
  findCartByCustomerId(id: Id): Promise<Cart>;
}
