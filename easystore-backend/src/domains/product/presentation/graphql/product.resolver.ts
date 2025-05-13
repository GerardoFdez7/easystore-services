import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ProductType,
  CreateProductInput,
  UpdateProductInput,
  VariantInput,
  UpdateVariantInput,
  PaginatedProductsType,
} from './product.types';
import {
  CreateProductDTO,
  CreateVariantDTO,
  RestoreProductDTO,
  UpdateProductDTO,
  UpdateVariantDTO,
  SoftDeleteProductDTO,
  HardDeleteProductDTO,
  DeleteVariantDTO,
} from '../../application/commands';
import {
  GetProductByIdDTO,
  GetProductsByNameDTO,
  GetAllProductsDTO,
} from '../../application/queries';

@Resolver(() => ProductType)
export class ProductResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => ProductType)
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(new CreateProductDTO({ ...input }));
  }

  @Mutation(() => ProductType)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(new UpdateProductDTO({ id, ...input }));
  }

  @Mutation(() => ProductType)
  async createVariant(
    @Args('productId') productId: string,
    @Args('input') input: VariantInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(new CreateVariantDTO(productId, input));
  }

  @Mutation(() => ProductType)
  async updateVariant(
    @Args('productId') productId: string,
    @Args('identifier') identifier: string,
    @Args('identifierType')
    identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute',
    @Args('attributeKey', { nullable: true }) attributeKey: string,
    @Args('input') input: UpdateVariantInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateVariantDTO(
        productId,
        identifier,
        identifierType,
        input,
        attributeKey,
      ),
    );
  }

  @Mutation(() => ProductType)
  async deleteVariant(
    @Args('productId') productId: string,
    @Args('identifier') identifier: string,
    @Args('identifierType')
    identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute',
    @Args('attributeKey', { nullable: true }) attributeKey: string,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new DeleteVariantDTO(productId, identifier, identifierType, attributeKey),
    );
  }

  @Mutation(() => ProductType)
  async softDeleteProduct(@Args('id') id: string): Promise<ProductType> {
    return this.commandBus.execute(new SoftDeleteProductDTO(id));
  }

  @Mutation(() => ProductType)
  async hardDeleteProduct(@Args('id') id: string): Promise<ProductType> {
    return this.commandBus.execute(new HardDeleteProductDTO(id));
  }

  @Mutation(() => ProductType)
  async restoreProduct(@Args('id') id: string): Promise<ProductType> {
    return this.commandBus.execute(new RestoreProductDTO(id));
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => ProductType)
  async getProductById(@Args('id') id: string): Promise<ProductType> {
    return this.queryBus.execute(new GetProductByIdDTO(id));
  }

  @Query(() => [ProductType])
  async getProductsByName(
    @Args('name') name: string,
    @Args('includeSoftDeleted', { nullable: true }) includeSoftDeleted: boolean,
  ): Promise<ProductType[]> {
    return this.queryBus.execute(
      new GetProductsByNameDTO(name, includeSoftDeleted),
    );
  }

  @Query(() => PaginatedProductsType)
  async getAllProducts(
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('categoryId', { nullable: true }) categoryId: string,
    @Args('includeSoftDeleted', { nullable: true }) includeSoftDeleted: boolean,
  ): Promise<{ products: ProductType[]; total: number }> {
    return this.queryBus.execute(
      new GetAllProductsDTO(page, limit, categoryId, includeSoftDeleted),
    );
  }
}
