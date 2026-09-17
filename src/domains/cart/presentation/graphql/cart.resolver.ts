import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CurrentUser,
  JwtPayload,
  AllowAccountTypes,
} from '@shared/presentation/decorators';
import { PaginationArgs } from '@shared/presentation/graphql/';
import { AccountTypeEnum } from '@shared/aggregates/value-objects';
import {
  CartType,
  PaginatedCartType,
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

  @AllowAccountTypes(AccountTypeEnum.CUSTOMER)
  @Mutation(() => CartType)
  async addItemToCart(
    @Args('input', { type: () => AddItemToCartInput })
    input: AddItemToCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new AddItemToCartDto(input, user.customerId, user.storeId),
    );
  }

  @AllowAccountTypes(AccountTypeEnum.CUSTOMER)
  @Mutation(() => CartType)
  async updateItemQty(
    @Args('input', { type: () => UpdateItemQtyInput })
    input: UpdateItemQtyInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new UpdateItemQuantityDto(input, user.customerId, user.storeId),
    );
  }

  @AllowAccountTypes(AccountTypeEnum.CUSTOMER)
  @Mutation(() => CartType)
  async removeItemFromCart(
    @Args('input', { type: () => RemoveItemFromCartInput })
    input: RemoveItemFromCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new RemoveItemFromCartDto(input, user.customerId, user.storeId),
    );
  }

  @AllowAccountTypes(AccountTypeEnum.CUSTOMER)
  @Mutation(() => CartType)
  async removeManyItemsFromCart(
    @Args('input', { type: () => RemoveManyItemFromCartInput })
    input: RemoveManyItemFromCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.commandBus.execute(
      new RemoveManyItemsFromCartDto(input, user.customerId, user.storeId),
    );
  }

  ///////////////
  // Queries   //
  ///////////////

  @AllowAccountTypes(AccountTypeEnum.CUSTOMER)
  @Query(() => PaginatedCartType)
  async getCart(
    @CurrentUser() user: JwtPayload,
    @Args() pagination: PaginationArgs,
  ): Promise<PaginatedCartType> {
    const { page, limit } = pagination;

    return this.queryBus.execute(
      new GetCartByCustomerIdDTO(user.customerId, user.storeId, page, limit),
    );
  }
}
