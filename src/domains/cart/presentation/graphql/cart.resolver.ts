import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, JwtPayload } from '@common/decorators';
import {
  CartType,
  CreateCartInput,
  PaginatedCartType,
  GetCartPaginatedInput,
} from './types';
import { CreateCartDto } from '../../application/commands/create/cart/create-cart.dto';
import {
  AddItemToCartInput,
  RemoveItemFromCartInput,
  RemoveManyItemFromCartInput,
  UpdateItemQtyInput,
} from './types/cart.types';
import { AddItemToCartDto } from '../../application/commands/create/cart-item/add-item-to-cart.dto';
import { RemoveItemFromCartDto } from '../../application/commands/delete/cart-item/remove-item-from-cart.dto';
import { GetCartByCustomerIdDTO } from '../../application/queries/get-cart-by-customer-id.dto';
import { UpdateItemQuantityDto } from '../../application/commands/update/update-item-quantity.dto';
import { RemoveManyItemsFromCartDto } from '../../application/commands/delete/cart-item/remove-many-items-from-cart.dto';

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
    @Args('input', { type: () => GetCartPaginatedInput, nullable: true })
    input?: GetCartPaginatedInput,
  ): Promise<PaginatedCartType> {
    const paginationParams = {
      page: input?.page || 1,
      limit: input?.limit || 10,
    };

    return this.queryBus.execute(
      new GetCartByCustomerIdDTO(
        user.customerId,
        paginationParams.page,
        paginationParams.limit,
      ),
    );
  }
}
