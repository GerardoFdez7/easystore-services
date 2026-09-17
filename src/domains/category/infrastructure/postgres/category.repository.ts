import { Injectable, BadRequestException } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  executeDatabaseOperation,
  handlePrismaDatabaseError,
} from '@shared/infrastructure/postgres/prisma-error-utils';
import { Prisma, Category as PrismaCategory } from '.prisma/postgres';
import {
  DatabaseOperationError,
  ResourceNotFoundError,
} from '@shared/infrastructure/postgres/errors';
import { Category, ICategoryType } from '../../aggregates/entities';
import { CategoryMapper } from '../../application/mappers';
import { Id, SortBy, SortOrder } from '../../aggregates/value-objects';
import ICategoryRepository from '../../aggregates/repositories/category.interface';

const categoryRelations = Prisma.validator<Prisma.CategoryInclude>()({
  subCategories: {
    include: {
      subCategories: true,
    },
  },
  parent: true,
});

@Injectable()
export default class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Creates a new category with transaction support and proper error handling
   */
  async create(category: Category): Promise<Category> {
    const categoryDto = CategoryMapper.toDto(category);

    try {
      const prismaCategory = await this.prisma.$transaction(async (tx) => {
        // Validate depth for the main category if it has a parent
        if (categoryDto.parentId) {
          const parentDepth = await this.calculateCategoryDepth(
            categoryDto.parentId,
            categoryDto.storeId,
            tx,
          );

          // Check if adding this category would exceed the limit
          if (parentDepth + 1 > 10) {
            throw new BadRequestException(
              `Category hierarchy cannot exceed 10 levels. ` +
                `Parent is at depth ${parentDepth}, adding this category would reach depth ${parentDepth + 1}`,
            );
          }
        }

        // Validate depth before creating if subcategories exist
        if (categoryDto.subCategories && categoryDto.subCategories.length > 0) {
          await this.validateCategoryDepth(
            categoryDto.parentId,
            categoryDto.storeId,
            categoryDto.subCategories,
            tx,
          );
        }

        // Create the main category
        const createdCategory = await tx.category.create({
          data: {
            id: categoryDto.id,
            name: categoryDto.name,
            cover: categoryDto.cover,
            description: categoryDto.description,
            parentId: categoryDto.parentId,
            storeId: categoryDto.storeId,
          },
          include: {
            subCategories: true,
            parent: true,
          },
        });

        // Handle subcategories if they exist
        if (categoryDto.subCategories && categoryDto.subCategories.length > 0) {
          await this.createSubCategories(
            tx,
            createdCategory.id,
            categoryDto.subCategories,
          );
        }

        // Return the created category with all relations
        return await tx.category.findUnique({
          where: {
            id_storeId: {
              id: createdCategory.id,
              storeId: categoryDto.storeId,
            },
          },
          include: categoryRelations,
        });
      });

      return this.mapToDomain(prismaCategory);
    } catch (error) {
      return this.handleDatabaseError(error, 'create category');
    }
  }

  /**
   * Updates an existing category with transaction support
   */
  async update(id: Id, storeId: Id, updates: Category): Promise<Category> {
    const idValue = id.getValue();
    const storeIdValue = storeId.getValue();
    const updatesDto = CategoryMapper.toDto(updates);

    return executeDatabaseOperation(
      async () => {
        const prismaCategory = await this.prisma.$transaction(async (tx) => {
          // Update the main category
          await tx.category.update({
            where: {
              id: idValue,
              storeId: storeIdValue,
            },
            data: {
              name: updatesDto.name,
              cover: updatesDto.cover,
              description: updatesDto.description,
              parentId: updatesDto.parentId,
            },
            include: {
              subCategories: true,
              parent: true,
            },
          });

          // Handle subcategories updates if provided
          if (updatesDto.subCategories !== undefined) {
            await this.updateSubCategories(
              tx,
              idValue,
              storeIdValue,
              updatesDto.subCategories,
            );
          }

          // Return updated category with all relations
          return await tx.category.findUnique({
            where: { id_storeId: { id: idValue, storeId: storeIdValue } },
            include: categoryRelations,
          });
        });

        return this.mapToDomain(prismaCategory);
      },
      (error) => this.handleDatabaseError(error, 'update category'),
    );
  }

  /**
   * Deletes a category with transaction support
   */
  async delete(id: Id, storeId: Id): Promise<void> {
    const categoryId = id.getValue();
    const categoryOwner = {
      id: categoryId,
      storeId: storeId.getValue(),
    };

    try {
      await this.prisma.$transaction(async (tx) => {
        // Check if category exists
        const existingCategory = await tx.category.findUnique({
          where: categoryOwner,
          include: {
            subCategories: true,
          },
        });

        if (!existingCategory) {
          throw new ResourceNotFoundError('Category', categoryId);
        }

        // Delete subcategories first (cascade)
        await tx.category.deleteMany({
          where: {
            parentId: categoryId,
          },
        });

        // Delete the main category
        await tx.category.delete({
          where: categoryOwner,
        });
      });
    } catch (error) {
      return this.handleDatabaseError(error, 'delete category');
    }
  }

  /**
   * Finds a category by ID with proper error handling
   */
  async findById(id: Id, storeId: Id): Promise<Category | null> {
    const idValue = id.getValue();
    const storeIdValue = storeId.getValue();

    try {
      const prismaCategory = await this.prisma.category.findUnique({
        where: {
          id: idValue,
          storeId: storeIdValue,
        },
        include: {
          subCategories: {
            include: {
              subCategories: true,
            },
          },
          parent: true,
        },
      });

      return prismaCategory ? this.mapToDomain(prismaCategory) : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'find category by id');
    }
  }

  /**
   * Finds all categories with pagination and filtering
   */
  async findAll(
    storeId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      parentId?: Id;
      includeSubcategories?: boolean;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ categories: Category[]; total: number; hasMore: boolean }> {
    const storeIdValue = storeId.getValue();
    const page = options?.page || 1;
    const limit = options?.limit || 25;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || SortBy.NAME;
    const sortOrder = options?.sortOrder || SortOrder.ASC;
    const includeSubcategories = options?.includeSubcategories ?? true;

    try {
      // Build where clause
      const whereClause: Prisma.CategoryWhereInput = {
        storeId: storeIdValue,
      };

      if (options?.name) {
        whereClause.OR = [
          {
            name: {
              contains: options.name,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: options.name,
              mode: 'insensitive',
            },
          },
        ];
      }

      if (options?.parentId) {
        whereClause.parentId = options.parentId.getValue();
      } else if (includeSubcategories) {
        // When includeSubcategories is true and no parentId is specified,
        // only return root categories to build proper tree structure
        whereClause.parentId = null;
      }

      const orderBy = this.getOrderBy(sortBy, sortOrder);

      // Type for recursive include structure
      type RecursiveInclude =
        | boolean
        | {
            include: {
              subCategories: RecursiveInclude;
            };
          };

      // Create recursive include structure for deep nesting
      const createRecursiveInclude = (depth: number): RecursiveInclude => {
        if (depth <= 0) return true;
        return {
          include: {
            subCategories: createRecursiveInclude(depth - 1),
          },
        };
      };

      // Execute queries in parallel
      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          where: whereClause,
          include: {
            subCategories: includeSubcategories
              ? createRecursiveInclude(10) // Support up to 10 levels deep
              : false,
            parent: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.category.count({
          where: whereClause,
        }),
      ]);

      const mappedCategories = categories.map((category) =>
        this.mapToDomain(category),
      );

      const hasMore = skip + categories.length < total;

      return {
        categories: mappedCategories,
        total,
        hasMore,
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'find all categories');
    }
  }

  /**
   * Finds multiple categories by their unique identifiers
   */
  async findByIds(ids: Id[], storeId: Id): Promise<Category[]> {
    const idsValues = ids.map((id) => id.getValue());
    const storeIdValue = storeId.getValue();

    try {
      const prismaCategories = await this.prisma.category.findMany({
        where: {
          storeId: storeIdValue,
          id: { in: idsValues },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return prismaCategories.map((category) => this.mapToDomain(category));
    } catch (error) {
      return this.handleDatabaseError(error, 'find categories by ids');
    }
  }

  /**
   * Calculates the depth of a category from its root parent (parentId = null)
   */
  private async calculateCategoryDepth(
    categoryId: string,
    storeId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const prismaClient = tx || this.prisma;
    let depth = 1;
    let currentCategoryId = categoryId;

    while (currentCategoryId) {
      const category = await prismaClient.category.findUnique({
        where: {
          id: currentCategoryId,
          storeId: storeId,
        },
        select: {
          parentId: true,
        },
      });

      if (!category) {
        break;
      }

      if (category.parentId === null) {
        // Found the root parent
        break;
      }

      currentCategoryId = category.parentId;
      depth++;

      // Safety check to prevent infinite loops
      if (depth > 20) {
        throw new DatabaseOperationError(
          'calculate category depth',
          'Category hierarchy is too deep or contains circular references',
        );
      }
    }

    return depth;
  }

  private getOrderBy(
    sortBy: SortBy,
    sortOrder: SortOrder,
  ): Prisma.CategoryOrderByWithRelationInput {
    switch (sortBy) {
      case SortBy.CREATED_AT:
        return { createdAt: sortOrder };
      case SortBy.UPDATED_AT:
        return { updatedAt: sortOrder };
      case SortBy.NAME:
      default:
        return { name: sortOrder };
    }
  }

  /**
   * Calculates the maximum depth of subcategories recursively
   */
  private calculateSubcategoriesDepth(subCategories: ICategoryType[]): number {
    if (!subCategories || subCategories.length === 0) {
      return 0;
    }

    let maxDepth = 0;
    for (const subCategory of subCategories) {
      const subDepth = this.calculateSubcategoriesDepth(
        subCategory.subCategories || [],
      );
      maxDepth = Math.max(maxDepth, subDepth + 1);
    }

    return maxDepth;
  }

  /**
   * Validates that adding subcategories won't exceed the 10-level limit
   */
  private async validateCategoryDepth(
    parentId: string | null,
    storeId: string,
    subCategories: ICategoryType[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const maxDepth = 10;

    // Calculate current depth from root parent
    let currentDepth = 0;
    if (parentId) {
      currentDepth = await this.calculateCategoryDepth(parentId, storeId, tx);
    }

    // Calculate the depth of the subcategories being added
    const subcategoriesDepth = this.calculateSubcategoriesDepth(subCategories);

    // Total depth would be current depth + 1 (for the parent) + subcategories depth
    const totalDepth = currentDepth + 1 + subcategoriesDepth;

    if (totalDepth > maxDepth) {
      throw new BadRequestException(
        `Category hierarchy cannot exceed ${maxDepth} levels. ` +
          `Current depth: ${currentDepth}, Subcategories depth: ${subcategoriesDepth}, ` +
          `Total would be: ${totalDepth}`,
      );
    }
  }

  /**
   * Helper method to update subcategories within a transaction
   */
  private async updateSubCategories(
    tx: Prisma.TransactionClient,
    parentId: string,
    storeId: string,
    subCategories: ICategoryType[],
  ): Promise<void> {
    // Load the parent within the same Store before changing its descendants.
    const parentCategory = await tx.category.findFirst({
      where: { id: parentId, storeId },
      select: { storeId: true },
    });

    if (!parentCategory) {
      throw new ResourceNotFoundError('Parent Category', parentId);
    }

    // Validate depth before processing any subcategories
    if (subCategories && subCategories.length > 0) {
      await this.validateCategoryDepth(
        parentId,
        parentCategory.storeId,
        subCategories,
        tx,
      );
    }

    // Get existing subcategories
    const existingSubCategories = await tx.category.findMany({
      where: { parentId, storeId },
      select: { id: true },
    });

    const existingIds = new Set(existingSubCategories.map((sc) => sc.id));
    const incomingIds = new Set(
      subCategories.map((sc) => sc.id).filter(Boolean),
    );

    // Delete subcategories that are no longer in the update
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (idsToDelete.length > 0) {
      await tx.category.deleteMany({
        where: {
          id: { in: idsToDelete },
          parentId,
          storeId,
        },
      });
    }

    // Update or create subcategories
    for (const subCategory of subCategories) {
      if (subCategory.id && existingIds.has(subCategory.id)) {
        // Update existing subcategory
        await tx.category.update({
          where: { id_storeId: { id: subCategory.id, storeId } },
          data: this.getSubCategoryData(subCategory, parentId),
        });

        // Recursively update nested subcategories
        if (subCategory.subCategories && subCategory.subCategories.length > 0) {
          await this.updateSubCategories(
            tx,
            subCategory.id,
            storeId,
            subCategory.subCategories,
          );
        }
      } else {
        await this.createSubCategoryTree(tx, parentId, subCategory);
      }
    }
  }

  /**
   * Helper method to create subcategories within a transaction
   */
  private async createSubCategories(
    tx: Prisma.TransactionClient,
    parentId: string,
    subCategories: ICategoryType[],
  ): Promise<void> {
    for (const subCategory of subCategories) {
      await this.createSubCategoryTree(tx, parentId, subCategory);
    }
  }

  private async createSubCategoryTree(
    tx: Prisma.TransactionClient,
    parentId: string,
    subCategory: ICategoryType,
  ): Promise<void> {
    const createdSubCategory = await tx.category.create({
      data: {
        id: subCategory.id,
        ...this.getSubCategoryData(subCategory, parentId),
      },
    });

    if (subCategory.subCategories?.length) {
      await this.createSubCategories(
        tx,
        createdSubCategory.id,
        subCategory.subCategories,
      );
    }
  }

  private getSubCategoryData(
    subCategory: ICategoryType,
    parentId: string,
  ): Pick<
    Prisma.CategoryUncheckedCreateInput,
    'name' | 'cover' | 'description' | 'parentId' | 'storeId'
  > {
    return {
      name: subCategory.name,
      cover: subCategory.cover,
      description: subCategory.description,
      parentId,
      storeId: subCategory.storeId,
    };
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Category',
      foreignKeyEntities: {
        parentId: 'Parent Category',
        storeId: 'Store',
      },
    });
  }

  /**
   * Maps Prisma category to domain entity
   */
  private mapToDomain(prismaCategory: PrismaCategory): Category {
    return CategoryMapper.fromPersistence(prismaCategory);
  }
}
