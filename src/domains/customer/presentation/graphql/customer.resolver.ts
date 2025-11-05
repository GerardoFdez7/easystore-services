import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CustomerType,
  WishListItemCreateInput,
  WishListItemDeleteInput,
  WishListManyItemsInput,
  WishListType,
  GetWishlistPaginatedInput,
  PaginatedWishlistType,
  CustomerReviewProductType,
  CreateCustomerReviewProductInput,
  UpdateCustomerReviewProductInput,
  DeleteCustomerReviewProductInput,
  GetCustomerReviewsPaginatedInput,
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
        { variantId: input.variantId, customerId: user.customerId },
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
      new CreateCustomerReviewProductDto(
        {
          ratingCount: input.ratingCount,
          comment: input.comment,
          variantId: input.variantId,
        },
        user.customerId,
        user.tenantId,
      ),
    );
  }

  @Mutation(() => CustomerType)
  async updateCustomer(
    @Args('input', { type: () => UpdateCustomerInput })
    input: UpdateCustomerInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CustomerType> {
    return await this.commandBus.execute(
      new UpdateCustomerDto(
        {
          name: input.name,
          defaultPhoneNumberId: input.defaultPhoneNumberId,
          defaultShippingAddressId: input.defaultShippingAddressId,
          defaultBillingAddressId: input.defaultBillingAddressId,
        },
        user.customerId,
        user.tenantId,
      ),
    );
  }

  @Mutation(() => CustomerReviewProductType)
  async updateReviewProduct(
    @Args('input', { type: () => UpdateCustomerReviewProductInput })
    input: UpdateCustomerReviewProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<CustomerReviewProductType> {
    return await this.commandBus.execute(
      new UpdateCustomerReviewProductDto(
        {
          id: input.id,
          ratingCount: input.ratingCount,
          comment: input.comment,
        },
        user.customerId,
        user.tenantId,
      ),
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
    @Args('input', { type: () => GetWishlistPaginatedInput })
    input: GetWishlistPaginatedInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedWishlistType> {
    return this.queryBus.execute(
      new FindWishlistItemsDto(
        user.customerId,
        input.variantIds ?? [],
        input.page,
        input.limit,
      ),
    );
  }

  @Query(() => PaginatedCustomerReviewProductWithVariantType)
  async getCustomerReviews(
    @Args('input', { type: () => GetCustomerReviewsPaginatedInput })
    input: GetCustomerReviewsPaginatedInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedCustomerReviewProductWithVariantType> {
    return this.queryBus.execute(
      new FindManyCustomerReviewsDto(
        user.customerId,
        input.reviewIds ?? [],
        input.page,
        input.limit,
      ),
    );
  }
}
