import {
  ID,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { optionalArg, pageArg } from '@common/graphql/argument-options';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { NamedPaginationArgs } from '@common/graphql/pagination.args';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  WarehouseType,
  PaginatedWarehousesType,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  AddStockToWarehouseInput,
  UpdateStockInWarehouseInput,
  PaginatedStockMovementsType,
  StockPerWarehouseFilterInput,
} from './types';
import {
  CreateWarehouseDTO,
  CreateStockPerWarehouseDTO,
  UpdateWarehouseDTO,
  UpdateStockPerWarehouseDTO,
  DeleteWarehouseDTO,
  DeleteStockPerWarehouseDTO,
} from '../../application/commands';
import {
  GetWarehouseByIdDTO,
  GetAllWarehousesDTO,
  GetAllStockMovementsDTO,
} from '../../application/queries';
import { PaginatedWarehousesDTO } from '../../application/mappers';
import { SortBy, SortOrder } from '../../aggregates/value-objects';

registerEnumType(SortBy, {
  name: 'SortBy',
});

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@Resolver(() => WarehouseType)
export default class InventoryResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => WarehouseType)
  async createWarehouse(
    @Args('input', { type: () => CreateWarehouseInput })
    input: CreateWarehouseInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WarehouseType> {
    const inputWithTenantId = { ...input, tenantId: user.tenantId };
    return this.commandBus.execute(new CreateWarehouseDTO(inputWithTenantId));
  }

  @Mutation(() => WarehouseType)
  async updateWarehouse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateWarehouseInput })
    input: UpdateWarehouseInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<WarehouseType> {
    return this.commandBus.execute(
      new UpdateWarehouseDTO(id, user.tenantId, input),
    );
  }

  @Mutation(() => WarehouseType)
  async deleteWarehouse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WarehouseType> {
    return this.commandBus.execute(new DeleteWarehouseDTO(id, user.tenantId));
  }

  @Mutation(() => WarehouseType)
  async addStockToWarehouse(
    @CurrentUser() user: JwtPayload,
    @Args('warehouseId', { type: () => ID }) warehouseId: string,
    @Args('variantId', { type: () => ID }) variantId: string,
    @Args('input', { type: () => AddStockToWarehouseInput })
    input: AddStockToWarehouseInput,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
  ): Promise<WarehouseType> {
    return this.commandBus.execute(
      new CreateStockPerWarehouseDTO(user.tenantId, reason, user.employeeId, {
        ...input,
        tenantId: user.tenantId,
        warehouseId,
        variantId,
      }),
    );
  }

  @Mutation(() => WarehouseType)
  async updateStockInWarehouse(
    @Args('stockId', { type: () => ID }) stockId: string,
    @Args('warehouseId', { type: () => ID }) warehouseId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input', { type: () => UpdateStockInWarehouseInput })
    input: UpdateStockInWarehouseInput,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
  ): Promise<WarehouseType> {
    return this.commandBus.execute(
      new UpdateStockPerWarehouseDTO(
        stockId,
        warehouseId,
        user.tenantId,
        input,
        reason,
        user.employeeId,
      ),
    );
  }

  @Mutation(() => WarehouseType)
  async removeStockFromWarehouse(
    @Args('warehouseId', { type: () => ID }) warehouseId: string,
    @Args('stockId', { type: () => ID }) stockId: string,
    @CurrentUser() user: JwtPayload,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
  ): Promise<WarehouseType> {
    return this.commandBus.execute(
      new DeleteStockPerWarehouseDTO(
        stockId,
        warehouseId,
        user.tenantId,
        reason,
        user.employeeId,
      ),
    );
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => WarehouseType)
  async getWarehouseById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
    @Args('isArchived', { nullable: true, type: () => Boolean })
    isArchived?: boolean,
  ): Promise<WarehouseType> {
    return this.queryBus.execute(
      new GetWarehouseByIdDTO(id, user.tenantId, isArchived),
    );
  }

  @Query(() => PaginatedWarehousesType)
  async getAllWarehouses(
    @CurrentUser() user: JwtPayload,
    @Args() pagination: NamedPaginationArgs,
    @Args('addressId', optionalArg(() => ID)) addressId?: string,
    @Args('sortBy', optionalArg(() => SortBy)) sortBy?: SortBy,
    @Args('sortOrder', optionalArg(() => SortOrder))
    sortOrder?: SortOrder,
    @Args('includeAddresses', {
      nullable: true,
      type: () => Boolean,
      defaultValue: false,
    })
    includeAddresses?: boolean,
    @Args('stockFilters', {
      nullable: true,
      type: () => StockPerWarehouseFilterInput,
    })
    stockFilters?: StockPerWarehouseFilterInput,
  ): Promise<PaginatedWarehousesDTO> {
    const { page, limit, name } = pagination;

    return this.queryBus.execute(
      new GetAllWarehousesDTO(
        user.tenantId,
        {
          page,
          limit,
          name,
          addressId,
          sortBy,
          sortOrder,
          includeAddresses,
        },
        {
          variantId: stockFilters?.variantId,
          lowStockThreshold: stockFilters?.lowStockThreshold,
          isArchived: stockFilters?.isArchived,
          stockSortBy: stockFilters?.sortBy,
          search: stockFilters?.search,
        },
      ),
    );
  }

  @Query(() => PaginatedStockMovementsType)
  async getAllStockMovements(
    @CurrentUser() user: JwtPayload,
    @Args('warehouseId', { type: () => ID })
    warehouseId: string,
    @Args('page', pageArg(1)) page?: number,
    @Args('limit', pageArg(10)) limit?: number,
    @Args('variantId', optionalArg(() => ID)) variantId?: string,
    @Args('createdById', optionalArg(() => ID)) createdById?: string,
    @Args('dateFrom', { nullable: true })
    dateFrom?: Date,
    @Args('dateTo', { nullable: true })
    dateTo?: Date,
    @Args('sortBy', optionalArg(() => SortBy)) sortBy?: SortBy,
    @Args('sortOrder', optionalArg(() => SortOrder))
    sortOrder?: SortOrder,
    @Args('includeDeleted', { defaultValue: false, nullable: true })
    includeDeleted?: boolean,
  ): Promise<PaginatedStockMovementsType> {
    return this.queryBus.execute(
      new GetAllStockMovementsDTO(user.tenantId, warehouseId, {
        page,
        limit,
        variantId,
        createdById,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
        includeDeleted,
      }),
    );
  }
}
