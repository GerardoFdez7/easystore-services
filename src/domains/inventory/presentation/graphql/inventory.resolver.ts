import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWarehouseInput, UpdateWarehouseInput } from './types/inventory.types';
import { CreateInventoryDTO } from '../../application/commands/create/create-inventory.dto';
import { UpdateWarehouseDTO } from '../../application/commands/update/update-warehouse.dto';
import { DeleteWarehouseDTO } from '../../application/commands/delete/delete-warehouse.dto';
import { GetWarehouseByIdQuery } from '../../application/queries/get-warehouse-by-id/get-warehouse-by-id.query';
import { GetAllWarehousesQuery } from '../../application/queries/get-all-warehouses/get-all-warehouses.query';
import { WarehouseDTO } from '../../application/mappers';

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

  @Mutation(() => WarehouseDTO)
  async createInventory(
    @Args('input') input: CreateWarehouseInput,
  ): Promise<WarehouseDTO> {
    return this.commandBus.execute(new CreateInventoryDTO({ ...input }));
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