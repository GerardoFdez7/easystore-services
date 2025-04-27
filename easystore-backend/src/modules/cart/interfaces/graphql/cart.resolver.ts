import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { AddToCartInput } from './dto/add-to-cart.input';
import { AddToCartCommand } from '../../application/commands/add-to-cart.command';
import { GetCartQuery } from '../../application/queries/get-cart.query';
import { ClearCartCommand } from '../../application/commands/clear-cart.command';
import { GqlAuthGuard } from '@common/guards/gql-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Resolver(() => CartDto)
export class CartResolver {
  private readonly logger = new Logger(CartResolver.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => CartDto)
  @UseGuards(GqlAuthGuard)
  async getCart(@CurrentUser() user: { id: number }): Promise<CartDto> {
    return this.queryBus.execute<CartDto>(new GetCartQuery(user.id));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async addToCart(
    @CurrentUser() user: { id: number },
    @Args('input') input: AddToCartInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new AddToCartCommand(user.id, input.productId, input.quantity),
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async clearCart(@CurrentUser() user: { id: number }): Promise<boolean> {
    try {
      await this.commandBus.execute(new ClearCartCommand(user.id));
      return true;
    } catch (error) {
      this.logger.error(
        `Error clearing cart for user with ID: ${user.id}`,
        error,
      );
      throw new InternalServerErrorException('Error al vaciar el carrito');
    }
  }
}
