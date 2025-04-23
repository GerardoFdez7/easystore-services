import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@common/guards/gql-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { InventoryDto } from '@modules/inventory/interfaces/graphql/dto/inventory.dto';
import { UpdateInventoryInput } from '@modules/inventory/interfaces/graphql/dto/update-inventory.input';
import { GetInventoryQuery } from '@modules/inventory/application/queries/get-inventory.query';
import { UpdateInventoryCommand } from '@modules/inventory/application/commands/update-inventory.command';
import { Logger } from '@nestjs/common';

@Resolver(() => InventoryDto)
export class InventoryResolver {
  private readonly logger = new Logger(InventoryResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => InventoryDto)
  @UseGuards(GqlAuthGuard)
  async getInventory(
    @Args('productId') productId: string,
    @Args('warehouseId', { type: () => Int, nullable: true })
    warehouseId?: number,
  ): Promise<InventoryDto> {
    this.logger.log(
      `Getting inventory for product ${productId}${warehouseId ? ` in warehouse ${warehouseId}` : ''}`,
    );
    return this.queryBus.execute<InventoryDto>(
      new GetInventoryQuery(productId, warehouseId),
    );
  }

  @Mutation(() => InventoryDto)
  @UseGuards(GqlAuthGuard)
  async updateInventory(
    @CurrentUser() user: { id: number; clientId: number },
    @Args('input') input: UpdateInventoryInput,
  ): Promise<InventoryDto> {
    this.logger.log(`Updating inventory for product ${input.productId}`);

    try {
      return await this.commandBus.execute(
        new UpdateInventoryCommand(
          input.productId,
          input.warehouseId,
          input.quantity,
          input.reason,
          user.id,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating inventory: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error updating inventory: Unknown error');
      }
      throw error;
    }
  }
}
