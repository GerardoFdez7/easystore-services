import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CustomerType,
  UpdateCustomerInput,
  WishListItemCreateInput,
  WishListItemDeleteInput,
  WishListType,
} from './types/customer.types';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { FindCustomerByIdDto } from '../../application/queries/one/find-customer-by-id.dto';
import { UpdateCustomerDto } from '../../application/commands/update/update-customer.dto';
import { CreateWishListDto } from '../../application/commands/create/wish-list/create-wish-list.dto';
import { DeleteWishListDto } from '../../application/commands/delete/wish-list/delete-wish-list.dto';

@Resolver(() => CustomerType)
export class CustomerResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////
  @Mutation(() => CustomerType)
  async updateCustomer(
    @Args('input', { type: () => UpdateCustomerInput })
    input: UpdateCustomerInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CustomerType> {
    return await this.commandBus.execute(
      new UpdateCustomerDto(input, user.customerId, user.tenantId),
    );
  }

  @Mutation(() => WishListType)
  async addVariantToWishList(
    @Args('input', { type: () => WishListItemCreateInput })
    input: WishListItemCreateInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WishListType> {
    return await this.commandBus.execute(
      new CreateWishListDto(
        { variantId: input.variantId, customerId: user.customerId },
        user.tenantId,
      ),
    );
  }

  @Mutation(() => Boolean)
  async removeVariantFromWishList(
    @Args('input', { type: () => WishListItemDeleteInput })
    input: WishListItemDeleteInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new DeleteWishListDto(user.customerId, input.variantId, user.tenantId),
    );
    return true;
  }

  ///////////////
  // Queries //
  ///////////////
  @Query(() => CustomerType)
  async getCustomerById(
    @CurrentUser() user: JwtPayload,
  ): Promise<CustomerType> {
    return this.queryBus.execute(
      new FindCustomerByIdDto(user.customerId, user.tenantId),
    );
  }
}
