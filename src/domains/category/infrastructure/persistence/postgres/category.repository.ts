import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { Prisma, Category as PrismaCategory } from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@domains/errors';
import { Category, ICategoryType } from '../../../aggregates/entities';
import { CategoryMapper } from '../../../application/mappers';
import { Id, SortBy, SortOrder } from '../../../aggregates/value-objects';
import ICategoryRepository from '../../../aggregates/repositories/category.interface';

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
        // Create the main category
        const createdCategory = await tx.category.create({
          data: {
            id: categoryDto.id,
            name: categoryDto.name,
            cover: categoryDto.cover,
            description: categoryDto.description,
            parentId: categoryDto.parentId,
            tenantId: categoryDto.tenantId,
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
          where: { id: createdCategory.id },
          include: {
            subCategories: {
              include: {
                subCategories: true,
              },
            },
            parent: true,
          },
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
  async update(id: Id, tenantId: Id, updates: Category): Promise<Category> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();
    const updatesDto = CategoryMapper.toDto(updates);

    try {
      const prismaCategory = await this.prisma.$transaction(async (tx) => {
        // Update the main category
        await tx.category.update({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
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
          // Delete existing subcategories
          await tx.category.deleteMany({
            where: {
              parentId: idValue,
            },
          });

          // Create new subcategories
          if (updatesDto.subCategories.length > 0) {
            await this.createSubCategories(
              tx,
              idValue,
              updatesDto.subCategories,
            );
          }
        }

        // Return updated category with all relations
        return await tx.category.findUnique({
          where: { id: idValue },
          include: {
            subCategories: {
              include: {
                subCategories: true,
              },
            },
            parent: true,
          },
        });
      });

      return this.mapToDomain(prismaCategory);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update category');
    }
  }

  /**
   * Deletes a category with transaction support
   */
  async delete(id: Id, tenantId: Id): Promise<void> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();

    try {
      await this.prisma.$transaction(async (tx) => {
        // Check if category exists
        const existingCategory = await tx.category.findUnique({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          include: {
            subCategories: true,
          },
        });

        if (!existingCategory) {
          throw new ResourceNotFoundError('Category', idValue);
        }

        // Delete subcategories first (cascade)
        await tx.category.deleteMany({
          where: {
            parentId: idValue,
          },
        });

        // Delete the main category
        await tx.category.delete({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
        });
      });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'delete category');
    }
  }

  /**
   * Finds a category by ID with proper error handling
   */
  async findById(id: Id, tenantId: Id): Promise<Category | null> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();

    try {
      const prismaCategory = await this.prisma.category.findUnique({
        where: {
          id: idValue,
          tenantId: tenantIdValue,
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
    tenantId: Id,
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
    const tenantIdValue = tenantId.getValue();
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || SortBy.CREATED_AT;
    const sortOrder = options?.sortOrder || SortOrder.DESC;
    const includeSubcategories = options?.includeSubcategories ?? true;

    try {
      // Build where clause
      const whereClause: Prisma.CategoryWhereInput = {
        tenantId: tenantIdValue,
      };

      if (options?.name) {
        whereClause.name = {
          contains: options.name,
          mode: 'insensitive',
        };
      }

      if (options?.parentId) {
        whereClause.parentId = options.parentId.getValue();
      }

      // Build order by clause
      const orderBy: Prisma.CategoryOrderByWithRelationInput = {};
      orderBy[sortBy] = sortOrder;

      // Execute queries in parallel
      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          where: whereClause,
          include: {
            subCategories: includeSubcategories
              ? {
                  include: {
                    subCategories: true,
                  },
                }
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
   * Helper method to create subcategories within a transaction
   */
  private async createSubCategories(
    tx: Prisma.TransactionClient,
    parentId: string,
    subCategories: ICategoryType[],
  ): Promise<void> {
    for (const subCategory of subCategories) {
      const createdSubCategory = await tx.category.create({
        data: {
          id: subCategory.id,
          name: subCategory.name,
          cover: subCategory.cover,
          description: subCategory.description,
          parentId: parentId,
          tenantId: subCategory.tenantId,
        },
      });

      // Recursively create nested subcategories
      if (subCategory.subCategories && subCategory.subCategories.length > 0) {
        await this.createSubCategories(
          tx,
          createdSubCategory.id,
          subCategory.subCategories,
        );
      }
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          // Unique constraint violation
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          throw new UniqueConstraintViolationError(
            field,
            `Category ${field} already exists`,
          );
        }
        case 'P2003': {
          // Foreign key constraint violation
          const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
          const fieldToEntityMap: Record<string, string> = {
            parentId: 'Parent Category',
            tenantId: 'Tenant',
          };
          const relatedEntity = fieldToEntityMap[field] || 'Related Entity';
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        case 'P2025': // Record not found
          throw new ResourceNotFoundError('Category');
        default:
          break;
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }

  /**
   * Maps Prisma category to domain entity
   */
  private mapToDomain(prismaCategory: PrismaCategory): Category {
    return CategoryMapper.fromPersistence(prismaCategory);
  }
}
