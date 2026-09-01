import {
  Args,
  Mutation,
  Query,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { PaginationArgs } from '@common/graphql/pagination.args';
import { SortOrder } from '@shared/value-objects';
import {
  CreateCustomerReviewProductDto,
  CreateWishListDto,
  DeleteCustomerReviewProductDto,
  DeleteManyWishListDto,
  DeleteWishListDto,
  UpdateCustomerDto,
  UpdateCustomerReviewProductDto,
} from '../../application/commands';
import {
  FindCustomerByIdDto,
  FindManyCustomerReviewsDto,
  FindWishlistItemsDto,
  WishListSortBy,
} from '../../application/queries';
import {
  CreateCustomerReviewProductInput,
  CustomerReviewPaginationArgs,
  CustomerReviewProductType,
  CustomerType,
  DeleteCustomerReviewProductInput,
  PaginatedCustomerReviewProductWithVariantType,
  PaginatedWishlistType,
  UpdateCustomerInput,
  UpdateCustomerReviewProductInput,
  WishListItemCreateInput,
  WishListItemDeleteInput,
  WishListManyItemsInput,
  WishListMultiStatusType,
  WishListType,
} from './types';

registerEnumType(WishListSortBy, { name: 'WishListSortBy' });
registerEnumType(SortOrder, { name: 'SortOrder' });

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

  @Mutation(() => WishListMultiStatusType)
  async removeManyVariantsFromWishList(
    @Args('input', { type: () => WishListManyItemsInput })
    input: WishListManyItemsInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WishListMultiStatusType> {
    return this.commandBus.execute(
      new DeleteManyWishListDto(
        user.customerId,
        input.variantIds,
        user.tenantId,
      ),
    );
  }

  ///////////////
  // Queries   //
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
    @Args() pagination: PaginationArgs,
    @Args('sortBy', { type: () => WishListSortBy, nullable: true })
    sortBy?: WishListSortBy,
    @Args('sortOrder', { type: () => SortOrder, nullable: true })
    sortOrder?: SortOrder,
  ): Promise<PaginatedWishlistType> {
    return this.queryBus.execute(
      new FindWishlistItemsDto(
        user.customerId,
        user.tenantId,
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder,
      ),
    );
  }

  @Query(() => PaginatedCustomerReviewProductWithVariantType)
  async getCustomerReviews(
    @CurrentUser() user: JwtPayload,
    @Args() pagination: CustomerReviewPaginationArgs,
  ): Promise<PaginatedCustomerReviewProductWithVariantType> {
    const { page, limit, reviewIds } = pagination;

    return this.queryBus.execute(
      new FindManyCustomerReviewsDto(
        user.customerId,
        user.tenantId,
        reviewIds,
        page,
        limit,
      ),
    );
  }
}
