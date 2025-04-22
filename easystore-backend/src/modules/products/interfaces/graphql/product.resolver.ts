import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { GqlAuthGuard } from '@common/guards/gql-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ProductDto } from '../../interfaces/graphql/dto/product.dto';
import { UpdateProductInput } from '../../interfaces/graphql/dto/update-product.input';
import { GetProductQuery } from '../../application/queries/get-product.query';
import { ListProductsQuery } from '../../application/queries/list-products.query';
import { UpdateProductCommand } from '../../application/commands/update-product.command';

@Resolver(() => ProductDto)
export class ProductResolver {
  private readonly logger = new Logger(ProductResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => ProductDto)
  async getProduct(
    @Args('id') id: string,
    @Args('clientId', { type: () => Int }) clientId: number,
  ): Promise<ProductDto> {
    this.logger.log(`Getting product ${id} for client ${clientId}`);
    return this.queryBus.execute(new GetProductQuery(id, clientId));
  }

  @Query(() => [ProductDto])
  async listProducts(
    @Args('clientId', { type: () => Int }) clientId: number,
    @Args('categoryId', { nullable: true }) categoryId?: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<ProductDto[]> {
    this.logger.log(`Listing products for client ${clientId}`);
    return this.queryBus.execute(
      new ListProductsQuery(clientId, categoryId, skip, take),
    );
  }

  @Mutation(() => ProductDto)
  @UseGuards(GqlAuthGuard)
  async updateProduct(
    @CurrentUser() user: { id: number; clientId: number },
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
  ): Promise<ProductDto> {
    this.logger.log(`Updating product ${id} for client ${user.clientId}`);

    try {
      await this.commandBus.execute(
        new UpdateProductCommand(id, user.clientId, input),
      );

      // Obtener el producto actualizado
      return this.queryBus.execute(new GetProductQuery(id, user.clientId));
    } catch (error: unknown) {
      this.logger.error(
        `Error updating product ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
