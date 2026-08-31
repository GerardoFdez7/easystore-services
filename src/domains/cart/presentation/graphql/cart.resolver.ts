import { Inject } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { PaginationArgs } from '@common/graphql/pagination.args';
import { Money } from '@shared/value-objects';
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
import { ITenantCurrencyAdapter } from '../../application/ports';
import { CartDTO } from '../../application/mappers';

@Resolver(() => CartType)
export class CartResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('ITenantCurrencyAdapter')
    private readonly tenantCurrencyAdapter: ITenantCurrencyAdapter,
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
    return this.withMoneyTotal(
      await this.commandBus.execute(
        new AddItemToCartDto(input, user.customerId),
      ),
      user.tenantId,
    );
  }

  @Mutation(() => CartType)
  async updateItemQty(
    @Args('input', { type: () => UpdateItemQtyInput })
    input: UpdateItemQtyInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.withMoneyTotal(
      await this.commandBus.execute(
        new UpdateItemQuantityDto(input, user.customerId),
      ),
      user.tenantId,
    );
  }

  @Mutation(() => CartType)
  async removeItemFromCart(
    @Args('input', { type: () => RemoveItemFromCartInput })
    input: RemoveItemFromCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.withMoneyTotal(
      await this.commandBus.execute(
        new RemoveItemFromCartDto(input, user.customerId),
      ),
      user.tenantId,
    );
  }

  @Mutation(() => CartType)
  async removeManyItemsFromCart(
    @Args('input', { type: () => RemoveManyItemFromCartInput })
    input: RemoveManyItemFromCartInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CartType> {
    return this.withMoneyTotal(
      await this.commandBus.execute(
        new RemoveManyItemsFromCartDto(input, user.customerId),
      ),
      user.tenantId,
    );
  }

  ///////////////
  // Queries   //
  ///////////////

  @Query(() => PaginatedCartType)
  async getCart(
    @CurrentUser() user: JwtPayload,
    @Args() pagination: PaginationArgs,
  ): Promise<PaginatedCartType> {
    const { page, limit } = pagination;

    return this.queryBus.execute(
      new GetCartByCustomerIdDTO(user.customerId, user.tenantId, page, limit),
    );
  }

  private async withMoneyTotal(
    cart: CartDTO,
    tenantId: string,
  ): Promise<CartType> {
    const currency = await this.tenantCurrencyAdapter.getCurrency(tenantId);

    return {
      ...cart,
      totalCart: Money.create(cart.totalCart.toString(), currency).getValue(),
    };
  }
}
