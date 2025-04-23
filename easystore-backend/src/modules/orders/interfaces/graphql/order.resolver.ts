import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from '@common/guards/gql-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CreateOrderInput } from '@modules/orders/interfaces/graphql/dto/create-order.input';
import { OrderDto } from '@modules/orders/interfaces/graphql/dto/order.dto';
import { CreateOrderCommand } from '@modules/orders/application/commands/create-order.command';
import { GetOrderQuery } from '@modules/orders/application/queries/get-order.query';

@Resolver(() => OrderDto)
export class OrderResolver {
  private readonly logger = new Logger(OrderResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Mutation(() => OrderDto)
  @UseGuards(GqlAuthGuard)
  async createOrder(
    @CurrentUser() user: { id: number },
    @Args('input') input: CreateOrderInput,
  ): Promise<OrderDto> {
    this.logger.log(
      `Creating order for user ${user.id} with cart ${input.cartId}`,
    );

    try {
      const result: OrderDto = await this.commandBus.execute<OrderDto>(
        new CreateOrderCommand(
          user.id,
          input.cartId.toString(),
          input.addressId.toString(),
        ),
      );

      this.logger.log(`Order created successfully: ${result.orderNumber}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Error creating order: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Query(() => OrderDto)
  @UseGuards(GqlAuthGuard)
  async getOrder(
    @CurrentUser() user: { id: number },
    @Args('orderNumber') orderNumber: string,
  ): Promise<OrderDto> {
    return this.queryBus.execute(new GetOrderQuery(orderNumber, user.id));
  }
}
