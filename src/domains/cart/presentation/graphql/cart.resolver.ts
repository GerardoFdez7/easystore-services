import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, JwtPayload } from '@common/decorators';
import {
  CartType,
  PaginatedCartType,
  GetCartPaginatedInput,
  AddItemToCartInput,
  RemoveItemFromCartInput,
  RemoveManyItemFromCartInput,
  UpdateItemQtyInput,
} from './types';
import {
  AddItemToCartDto,
  RemoveItemFromCartDto,
  UpdateItemQuantityDto,
  RemoveManyItemsFromCartDto,
} from '../../application/commands';
import { GetCartByCustomerIdDTO } from '../../application/queries';

@Resolver(() => CartType)
export class CartResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => CartType)
  async addItemToCart(
    @Args('input', { type: () => AddItemToCartInput })
    input: AddItemToCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new AddItemToCartDto(input, user.customerId),
    );
  }

  @Mutation(() => CartType)
  async updateItemQty(
    @Args('input', { type: () => UpdateItemQtyInput })
    input: UpdateItemQtyInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new UpdateItemQuantityDto(input, user.customerId),
    );
  }

  @Mutation(() => CartType)
  async removeItemFromCart(
    @Args('input', { type: () => RemoveItemFromCartInput })
    input: RemoveItemFromCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new RemoveItemFromCartDto(input, user.customerId),
    );
  }

  @Mutation(() => CartType)
  async removeManyItemsFromCart(
    @Args('input', { type: () => RemoveManyItemFromCartInput })
    input: RemoveManyItemFromCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new RemoveManyItemsFromCartDto(input, user.customerId),
    );
  }

  ///////////////
  // Queries //
  ///////////////
  @Query(() => PaginatedCartType)
  async getCart(
    @CurrentUser() user: JwtPayload,
    @Args('input', { type: () => GetCartPaginatedInput })
    input: GetCartPaginatedInput,
  ): Promise<PaginatedCartType> {
    // Validate and constrain pagination parameters
    const page = Math.max(1, input.page);
    const limit = Math.min(50, Math.max(1, input.limit));

    return this.queryBus.execute(
      new GetCartByCustomerIdDTO(user.customerId, page, limit),
    );
  }
}
