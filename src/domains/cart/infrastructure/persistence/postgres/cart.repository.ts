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
import { Id } from '@shared/value-objects';
import { Cart } from 'src/domains/cart/aggregates/entities/cart.entity';
import { CartItem } from 'src/domains/cart/aggregates/value-objects/cart-item.vo';
import { ICartRepository } from 'src/domains/cart/aggregates/repositories/cart.interface';
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

  async findCartByCustomerId(id: Id): Promise<Cart> {
    try {
      const prismaCart = await this.prisma.cart.findFirst({
        where: { customerId: id.getValue() },
        include: {
          cartItems: true,
        },
      });

      return this.mapToDomain(prismaCart);
    } catch (error) {
      return this.handleDatabaseError(error, 'find cart by id');
    }
  }

  async findCartById(id: Id): Promise<Cart> {
    try {
      const prismaCart = await this.prisma.cart.findUnique({
        where: { id: id.getValue() },
        include: {
          cartItems: true,
        },
      });

      return this.mapToDomain(prismaCart);
    } catch (error) {
      return this.handleDatabaseError(error, 'find cart by id');
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

        // Delete all existing cart items for this cart
        await tx.cartItem.deleteMany({
          where: { cartId: cartDto.id },
        });

        // Create new cart items if they exist
        if (cartDto.cartItems && cartDto.cartItems.length > 0) {
          await tx.cartItem.createMany({
            data: cartDto.cartItems.map((item) => ({
              id: item.id,
              qty: item.qty,
              variantId: item.variantId,
              cartId: updatedCart.id,
              promotionId: item.promotionId,
              updatedAt: item.updatedAt,
            })),
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
        const cartItem = CartItem.create({
          qty: item.qty,
          variantId: item.variantId,
          promotionId: item?.promotionId || null,
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
