import { Cart } from '../entities/cart.entity';

export class RemoveManyItemsFromCart {
  constructor(private readonly cart: Cart) {}
}
