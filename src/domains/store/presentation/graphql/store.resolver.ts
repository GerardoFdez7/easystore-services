import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AccountTypeEnum } from '@shared/aggregates/value-objects';
import {
  AllowAccountTypes,
  CurrentUser,
  JwtPayload,
} from '@shared/presentation/decorators';
import { CreateStoreDTO, UpdateStoreDTO } from '../../application/commands';
import { GetAllStoresDTO, GetStoreByIdDTO } from '../../application/queries';
import {
  CreateStoreInput,
  PaginatedStoresType,
  StoreType,
  UpdateStoreInput,
} from './types';

@Resolver(() => StoreType)
export default class StoreResolver {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @AllowAccountTypes(AccountTypeEnum.TENANT)
  @Mutation(() => StoreType)
  createStore(
    @Args('input') input: CreateStoreInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<StoreType> {
    return this.commands.execute(
      new CreateStoreDTO({ ...input, tenantId: user.tenantId }),
    );
  }
  @AllowAccountTypes(AccountTypeEnum.TENANT)
  @Mutation(() => StoreType)
  updateStore(
    @Args('input') input: UpdateStoreInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<StoreType> {
    return this.commands.execute(
      new UpdateStoreDTO(user.storeId, user.tenantId, input),
    );
  }
  @AllowAccountTypes(AccountTypeEnum.TENANT)
  @Query(() => StoreType)
  getStoreById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<StoreType> {
    return this.queries.execute(new GetStoreByIdDTO(id, user.tenantId));
  }
  @AllowAccountTypes(AccountTypeEnum.TENANT)
  @Query(() => PaginatedStoresType)
  getAllStores(
    @CurrentUser() user: JwtPayload,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<PaginatedStoresType> {
    return this.queries.execute(
      new GetAllStoresDTO(user.tenantId, page, limit),
    );
  }
}
