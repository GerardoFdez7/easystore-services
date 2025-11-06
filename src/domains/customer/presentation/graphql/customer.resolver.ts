import { Args, Mutation, Query, Resolver, Int, ID } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CustomerType,
  WishListItemCreateInput,
  WishListItemDeleteInput,
  WishListManyItemsInput,
  WishListType,
  PaginatedWishlistType,
  CustomerReviewProductType,
  CreateCustomerReviewProductInput,
  UpdateCustomerReviewProductInput,
  DeleteCustomerReviewProductInput,
  PaginatedCustomerReviewProductWithVariantType,
  UpdateCustomerInput,
} from './types/customer.types';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { FindCustomerByIdDto } from '../../application/queries/one/customer/find-customer-by-id.dto';
import { CreateWishListDto } from '../../application/commands/create/wish-list/create-wish-list.dto';
import { DeleteWishListDto } from '../../application/commands/delete/wish-list/one/delete-wish-list.dto';
import { DeleteManyWishListDto } from '../../application/commands/delete/wish-list/many/delete-many-wish-list.dto';
import { FindWishlistItemsDto } from '../../application/queries/many/wish-list/find-wish-list-items.dto';
import { CreateCustomerReviewProductDto } from '../../application/commands/create/review/create-customer-review-product.dto';
import { UpdateCustomerReviewProductDto } from '../../application/commands/update/review/update-customer-review-product.dto';
import { DeleteCustomerReviewProductDto } from '../../application/commands/delete/review/delete-customer-review-product.dto';
import { FindManyCustomerReviewsDto } from '../../application/queries/many/review/find-many-customer-reviews.dto';
import { UpdateCustomerDto } from '../../application/commands/update/customer/update-customer.dto';

@Resolver(() => CustomerType)
export class CustomerResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////
  @Mutation(() => WishListType)
  async addVariantToWishList(
    @Args('input', { type: () => WishListItemCreateInput })
    input: WishListItemCreateInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WishListType> {
    return await this.commandBus.execute(
      new CreateWishListDto(
        { ...input, customerId: user.customerId },
        user.tenantId,
      ),
    );
  }

  @Mutation(() => CustomerReviewProductType)
  async addReviewProduct(
    @Args('input', { type: () => CreateCustomerReviewProductInput })
    input: CreateCustomerReviewProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CustomerReviewProductType> {
    return await this.commandBus.execute(
      new CreateCustomerReviewProductDto(input, user.customerId, user.tenantId),
    );
  }

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

  @Mutation(() => CustomerReviewProductType)
  async updateReviewProduct(
    @Args('input', { type: () => UpdateCustomerReviewProductInput })
    input: UpdateCustomerReviewProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CustomerReviewProductType> {
    return await this.commandBus.execute(
      new UpdateCustomerReviewProductDto(input, user.customerId, user.tenantId),
    );
  }

  @Mutation(() => Boolean)
  async deleteReviewProduct(
    @Args('input', { type: () => DeleteCustomerReviewProductInput })
    input: DeleteCustomerReviewProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new DeleteCustomerReviewProductDto(
        user.customerId,
        input.id,
        user.tenantId,
      ),
    );
    return true;
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

  @Mutation(() => Boolean)
  async removeManyVariantsFromWishList(
    @Args('input', { type: () => WishListManyItemsInput })
    input: WishListManyItemsInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new DeleteManyWishListDto(
        user.customerId,
        input.variantIds,
        user.tenantId,
      ),
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

  @Query(() => PaginatedWishlistType)
  async getWishListItems(
    @CurrentUser() user: JwtPayload,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 25 })
    limit: number,
    @Args('variantIds', {
      type: () => [ID],
      nullable: true,
      defaultValue: [],
    })
    variantIds: string[],
  ): Promise<PaginatedWishlistType> {
    return this.queryBus.execute(
      new FindWishlistItemsDto(user.customerId, variantIds, page, limit),
    );
  }

  @Query(() => PaginatedCustomerReviewProductWithVariantType)
  async getCustomerReviews(
    @CurrentUser() user: JwtPayload,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 25 })
    limit: number,
    @Args('reviewIds', { type: () => [ID], nullable: true, defaultValue: [] })
    reviewIds: string[],
  ): Promise<PaginatedCustomerReviewProductWithVariantType> {
    return this.queryBus.execute(
      new FindManyCustomerReviewsDto(user.customerId, reviewIds, page, limit),
    );
  }
}
