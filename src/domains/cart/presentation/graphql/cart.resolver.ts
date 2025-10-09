import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { CartType, CreateCartInput } from './types';
import { CreateCartDto } from '../../application/commands/create/cart/create-cart.dto';
import { AddItemToCartInput } from './types/cart.types';
import { AddItemToCartDto } from '../../application/commands/create/cart-item/add-item-to-cart.dto';

@Resolver(() => CartType)
export class CartResolver {
  constructor(private readonly commandBus: CommandBus) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => CartType)
  async createCart(
    @Args('input', { type: () => CreateCartInput })
    input: CreateCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    // Use the authenticated user's customer ID or auth identity ID
    const customerId = user.customerId;

    const cartData = {
      ...input,
      customerId,
    };

    return this.commandBus.execute(new CreateCartDto(cartData));
  }

  @Mutation(() => CartType)
  async addItemToCart(
    @Args('input', { type: () => AddItemToCartInput })
    input: AddItemToCartInput,
  ): Promise<CartType> {
    return this.commandBus.execute(new AddItemToCartDto(input));
  }
}
