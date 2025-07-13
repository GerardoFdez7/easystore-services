import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { CreateWarehouseInput } from './types/inventory.types';
import { CreateInventoryDTO } from '../../application/commands/create/create-inventory.dto';
import { DeleteWarehouseDTO } from '../../application/commands/delete/delete-warehouse.dto';
import { WarehouseDTO } from '../../application/mappers';

@Resolver(() => WarehouseDTO)
export class InventoryResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => WarehouseDTO)
  async createInventory(
    @Args('input') input: CreateWarehouseInput,
  ): Promise<WarehouseDTO> {
    return this.commandBus.execute(new CreateInventoryDTO({ ...input }));
  }

  @Mutation(() => WarehouseDTO)
  async deleteWarehouse(
    @Args('id') id: string,
  ): Promise<WarehouseDTO> {
    return this.commandBus.execute(new DeleteWarehouseDTO(id));
  }
} 