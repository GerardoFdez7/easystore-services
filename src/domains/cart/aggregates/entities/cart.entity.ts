import { Entity, EntityProps } from '@shared/entity.base';
import { Id } from '@shared/value-objects';
import { CartItem } from '../value-objects';

export interface ICartProps extends EntityProps {
  id: Id;
  customerId: Id;
  cartItems: CartItem[];
}

export class Cart extends Entity<ICartProps> {
  private constructor(props: ICartProps) {
    super(props);
  }

  static reconstitute(props: ICartProps): Cart {
    return new Cart(props);
  }
}
