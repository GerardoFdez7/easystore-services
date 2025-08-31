import {
  ID,
  Int,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  WarehouseType,
  PaginatedWarehousesType,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  AddStockToWarehouseInput,
  UpdateStockInWarehouseInput,
  PaginatedStockMovementsType,
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
  ): Promise<WarehouseType> {
    return this.queryBus.execute(new GetWarehouseByIdDTO(id, user.tenantId));
  }

  @Query(() => PaginatedWarehousesType)
  async getAllWarehouses(
    @CurrentUser() user: JwtPayload,
    @Args('page', { defaultValue: 1, nullable: true, type: () => Int })
    page?: number,
    @Args('limit', { defaultValue: 10, nullable: true, type: () => Int })
    limit?: number,
    @Args('name', { nullable: true, type: () => String }) name?: string,
    @Args('addressId', { nullable: true, type: () => ID })
    addressId?: string,
    @Args('variantId', { nullable: true, type: () => ID })
    variantId?: string,
    @Args('lowStockThreshold', { nullable: true, type: () => Int })
    lowStockThreshold?: number,
    @Args('sortBy', { nullable: true, type: () => SortBy })
    sortBy?: SortBy,
    @Args('sortOrder', { nullable: true, type: () => SortOrder })
    sortOrder?: SortOrder,
    @Args('isArchived', { nullable: true, type: () => Boolean })
    isArchived?: boolean,
  ): Promise<PaginatedWarehousesDTO> {
    return this.queryBus.execute(
      new GetAllWarehousesDTO(user.tenantId, {
        page,
        limit,
        name,
        addressId,
        variantId,
        lowStockThreshold,
        sortBy,
        sortOrder,
        isArchived,
      }),
    );
  }

  @Query(() => PaginatedStockMovementsType)
  async getAllStockMovements(
    @Args('warehouseId', { type: () => ID })
    warehouseId: string,
    @Args('page', { defaultValue: 1, nullable: true, type: () => Int })
    page?: number,
    @Args('limit', { defaultValue: 10, nullable: true, type: () => Int })
    limit?: number,
    @Args('variantId', { nullable: true, type: () => ID })
    variantId?: string,
    @Args('createdById', { nullable: true, type: () => ID })
    createdById?: string,
    @Args('dateFrom', { nullable: true })
    dateFrom?: Date,
    @Args('dateTo', { nullable: true })
    dateTo?: Date,
    @Args('sortBy', { nullable: true, type: () => SortBy })
    sortBy?: SortBy,
    @Args('sortOrder', { nullable: true, type: () => SortOrder })
    sortOrder?: SortOrder,
    @Args('includeDeleted', { defaultValue: false, nullable: true })
    includeDeleted?: boolean,
  ): Promise<PaginatedStockMovementsType> {
    return this.queryBus.execute(
      new GetAllStockMovementsDTO(warehouseId, {
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
