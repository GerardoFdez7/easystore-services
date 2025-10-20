import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  Prisma,
  Cart as PrismaCart,
  CartItem as PrismaCartItem,
} from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@shared/errors';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { Cart } from '../../../aggregates/entities/cart.entity';
import { CartItem, Id } from '../../../aggregates/value-objects';
import { ICartRepository } from '../../../aggregates/repositories/cart.interface';
import { CartMapper } from '../../../application/mappers/cart/cart.mapper';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PostgreService) {}

  async create(cart: Cart): Promise<Cart> {
    const cartDto = CartMapper.toDto(cart);

    try {
      const prismaCart = await this.prisma.$transaction(async (tx) => {
        // Create the cart
        const createdCart = await tx.cart.create({
          data: {
            id: cartDto.id,
            customerId: cartDto.customerId,
          },
        });

        // Create cart items if they exist
        if (cartDto.cartItems && cartDto.cartItems.length > 0) {
          await tx.cartItem.createMany({
            data: cartDto.cartItems.map((item) => ({
              id: item.id,
              qty: item.qty,
              variantId: item.variantId,
              cartId: createdCart.id,
              promotionId: item.promotionId,
              updatedAt: item.updatedAt,
            })),
          });
        }

        // Return the created cart with its items
        return await tx.cart.findUnique({
          where: { id: createdCart.id },
          include: {
            cartItems: true,
          },
        });
      });

      return this.mapToDomain(prismaCart);
    } catch (error) {
      return this.handleDatabaseError(error, 'create cart');
    }
  }

  async findCartByCustomerId(
    id: Id,
    page?: number,
    limit?: number,
  ): Promise<Cart> {
    try {
      // Use default values if pagination parameters are not provided
      const actualPage = page || 1;
      const actualLimit = limit || 50; // Default limit

      // Calculate offset for pagination
      const offset = (actualPage - 1) * actualLimit;

      const prismaCart = await this.prisma.cart.findFirst({
        where: { customerId: id.getValue() },
        include: {
          cartItems: {
            skip: offset,
            take: actualLimit,
            orderBy: {
              updatedAt: 'desc', // Most recently updated items first
            },
          },
        },
      });

      return this.mapToDomain(prismaCart);
    } catch (error) {
      return this.handleDatabaseError(error, 'find cart by id');
    }
  }

  async getCartItemsCount(id: Id): Promise<number> {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: { customerId: id.getValue() },
        include: {
          _count: {
            select: {
              cartItems: true,
            },
          },
        },
      });

      return cart?._count?.cartItems || 0;
    } catch (error) {
      return this.handleDatabaseError(error, 'get cart items count');
    }
  }

  async update(cart: Cart): Promise<Cart> {
    const cartDto = CartMapper.toDto(cart);

    try {
      const prismaCart = await this.prisma.$transaction(async (tx) => {
        // Update the cart basic information
        const updatedCart = await tx.cart.update({
          where: { id: cartDto.id },
          data: {
            customerId: cartDto.customerId,
          },
        });

        // Fetch existing cart items from the database
        const existingItems = await tx.cartItem.findMany({
          where: { cartId: cartDto.id },
        });

        const existingItemsMap = new Map(
          existingItems.map((item) => [item.id, item]),
        );
        const newItemsMap = new Map(
          (cartDto.cartItems || []).map((item) => [item.id, item]),
        );

        // Determine items to delete (in DB but not in new set)
        const itemsToDelete = existingItems.filter(
          (item) => !newItemsMap.has(item.id),
        );

        // Determine items to create (in new set but not in DB)
        const itemsToCreate = (cartDto.cartItems || []).filter(
          (item) => !existingItemsMap.has(item.id),
        );

        // Determine items to update (in both, but with changed fields)
        const itemsToUpdate = (cartDto.cartItems || []).filter((item) => {
          const existing = existingItemsMap.get(item.id);
          if (!existing) return false;
          // Compare fields that may change
          return (
            existing.qty !== item.qty ||
            existing.variantId !== item.variantId ||
            existing.promotionId !== item.promotionId ||
            existing.updatedAt?.getTime?.() !==
              (item.updatedAt instanceof Date
                ? item.updatedAt.getTime()
                : new Date(item.updatedAt).getTime())
          );
        });

        // Delete removed items
        for (const item of itemsToDelete) {
          await tx.cartItem.delete({
            where: { id: item.id },
          });
        }

        // Create new items
        for (const item of itemsToCreate) {
          await tx.cartItem.create({
            data: {
              id: item.id,
              qty: item.qty,
              variantId: item.variantId,
              cartId: updatedCart.id,
              promotionId: item.promotionId,
              updatedAt: item.updatedAt,
            },
          });
        }

        // Update changed items
        for (const item of itemsToUpdate) {
          await tx.cartItem.update({
            where: { id: item.id },
            data: {
              qty: item.qty,
              variantId: item.variantId,
              promotionId: item.promotionId,
              updatedAt: item.updatedAt,
            },
          });
        }

        // Return the updated cart with its items
        return await tx.cart.findUnique({
          where: { id: updatedCart.id },
          include: {
            cartItems: true,
          },
        });
      });

      return this.mapToDomain(prismaCart);
    } catch (error) {
      return this.handleDatabaseError(error, 'update cart');
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
            `Cart ${field} already exists`,
          );
        }
        case 'P2003': {
          // Foreign key constraint violation
          const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
          const fieldToEntityMap: Record<string, string> = {
            customerId: 'Customer',
            variantId: 'Variant',
            promotionId: 'Promotion',
          };
          const relatedEntity = fieldToEntityMap[field] || 'Related Entity';
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        case 'P2025': // Record not found
          throw new ResourceNotFoundError('Cart');
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
   * Maps Prisma cart to domain entity
   */
  private mapToDomain(
    prismaCart: (PrismaCart & { cartItems?: PrismaCartItem[] }) | null,
  ): Cart {
    if (!prismaCart) {
      throw new ResourceNotFoundError('Cart');
    }

    const cartItems = new Map<string, CartItem>();

    // Map cart items if they exist
    if (prismaCart.cartItems) {
      prismaCart.cartItems.forEach((item) => {
        const cartItem = CartItem.reconstitute({
          id: item.id,
          qty: item.qty,
          variantId: item.variantId,
          promotionId: item?.promotionId || null,
          updatedAt: item.updatedAt,
        });
        cartItems.set(item.variantId, cartItem);
      });
    }

    return Cart.reconstitute({
      id: Id.create(prismaCart.id),
      customerId: Id.create(prismaCart.customerId),
      cartItems: cartItems,
    });
  }
}
