import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { CartType, CreateCartInput } from './types';
import { CreateCartDto } from '../../application/commands/create/create-cart.dto';

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
}
