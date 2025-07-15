import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWarehouseInput, UpdateWarehouseInput, CreateStockPerWarehouseInput, UpdateStockPerWarehouseInput } from './types/inventory.types';
import { CreateInventoryDTO } from '../../application/commands/create/create-inventory.dto';
import { CreateStockPerWarehouseDTO } from '../../application/commands/create/create-stock-per-warehouse.dto';
import { UpdateWarehouseDTO } from '../../application/commands/update/update-warehouse.dto';
import { UpdateStockPerWarehouseDTO } from '../../application/commands/update/update-stock-per-warehouse.dto';
import { DeleteWarehouseDTO } from '../../application/commands/delete/delete-warehouse.dto';
import { DeleteStockPerWarehouseDTO } from '../../application/commands/delete/delete-stock-per-warehouse.dto';
import { GetWarehouseByIdQuery } from '../../application/queries/get-warehouse-by-id/get-warehouse-by-id.query';
import { GetAllWarehousesQuery } from '../../application/queries/get-all-warehouses/get-all-warehouses.query';
import { GetStockPerWarehouseByIdQuery } from '../../application/queries/get-stock-per-warehouse-by-id/get-stock-per-warehouse-by-id.query';
import { GetAllStockPerWarehouseByWarehouseIdQuery } from '../../application/queries/get-all-stock-per-warehouse-by-warehouse-id/get-all-stock-per-warehouse-by-warehouse-id.query';
import { WarehouseDTO } from '../../application/mappers';
import { StockPerWarehouseDTO } from '../../application/mappers';

@Resolver(() => WarehouseDTO)
export class InventoryResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => WarehouseDTO, { nullable: true })
  async getWarehouse(@Args('id') id: string): Promise<WarehouseDTO | null> {
    return this.queryBus.execute(new GetWarehouseByIdQuery(id));
  }

  @Query(() => [WarehouseDTO])
  async getAllWarehouses(): Promise<WarehouseDTO[]> {
    return this.queryBus.execute(new GetAllWarehousesQuery());
  }

  @Query(() => StockPerWarehouseDTO, { nullable: true })
  async getStockPerWarehouse(@Args('id') id: string): Promise<StockPerWarehouseDTO | null> {
    return this.queryBus.execute(new GetStockPerWarehouseByIdQuery(id));
  }

  @Query(() => [StockPerWarehouseDTO])
  async getAllStockPerWarehouseByWarehouseId(@Args('warehouseId') warehouseId: string): Promise<StockPerWarehouseDTO[]> {
    return this.queryBus.execute(new GetAllStockPerWarehouseByWarehouseIdQuery(warehouseId));
  }

  @Mutation(() => WarehouseDTO)
  async createInventory(
    @Args('input') input: CreateWarehouseInput,
  ): Promise<WarehouseDTO> {
    return this.commandBus.execute(new CreateInventoryDTO({ ...input }));
  }

  @Mutation(() => StockPerWarehouseDTO)
  async createStockPerWarehouse(
    @Args('input') input: CreateStockPerWarehouseInput,
  ): Promise<StockPerWarehouseDTO> {
    return this.commandBus.execute(new CreateStockPerWarehouseDTO({ ...input }));
  }

  @Mutation(() => StockPerWarehouseDTO)
  async updateStockPerWarehouse(
    @Args('id') id: string,
    @Args('input') input: UpdateStockPerWarehouseInput,
  ): Promise<StockPerWarehouseDTO> {
    return this.commandBus.execute(new UpdateStockPerWarehouseDTO(id, input));
  }

  @Mutation(() => StockPerWarehouseDTO)
  async deleteStockPerWarehouse(
    @Args('id') id: string,
  ): Promise<StockPerWarehouseDTO> {
    return this.commandBus.execute(new DeleteStockPerWarehouseDTO(id));
  }

  @Mutation(() => WarehouseDTO)
  async updateWarehouse(
    @Args('id') id: string,
    @Args('input') input: UpdateWarehouseInput,
  ): Promise<WarehouseDTO> {
    return this.commandBus.execute(new UpdateWarehouseDTO(id, input));
  }

  @Mutation(() => WarehouseDTO)
  async deleteWarehouse(
    @Args('id') id: string,
  ): Promise<WarehouseDTO> {
    return this.commandBus.execute(new DeleteWarehouseDTO(id));
  }
} 