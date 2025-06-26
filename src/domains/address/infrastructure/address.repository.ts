import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { Prisma, Address as prismaAddress } from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@domains/errors';
import { Address } from '../aggregates/entities';
//import { Id, SortBy, SortOrder } from '../aggregates/value-objects';
import IAddressRepository from '../aggregates/repositories/address.interface';
import { AddressMapper } from '../application/mappers';
import { Id } from '@domains/value-objects';

@Injectable()
export default class AddressRepository implements IAddressRepository {
  constructor(private readonly prisma: PostgreService) {}

  async create(address: Address): Promise<Address> {
    const addressDto = AddressMapper.toDto(address);
    try {
      const prismaAddress = await this.prisma.$transaction(async (tx) => {
        const createdAdress = await tx.address.create({
          data: {
            id: addressDto.id,
            name: addressDto.name,
            addressLine1: addressDto.addressLine1,
            addressLine2: addressDto.addressLine2,
            postalCode: addressDto.postalCode,
            city: addressDto.city,
            countryId: addressDto.countryId,
            addressType: addressDto.addressType,
            deliveryNum: addressDto.deliveryNum,
            tenantId: addressDto.tenantId,
            customerId: addressDto.customerId,
          },
        });

        return await tx.address.findUnique({
          where: { id: createdAdress.id },
        });
      });

      return this.mapToDomain(prismaAddress);
    } catch (error) {
      return this.handleDatabaseError(error, 'create address');
    }
  }

  async delete(id: Id): Promise<void> {
    const idValue = id.getValue();
    try {
      await this.prisma.$transaction(async (tx) => {
        const address = await tx.address.findUnique({
          where: { id: idValue },
        });

        if (!address) {
          throw new ResourceNotFoundError('Address');
        }

        await tx.address.delete({ where: { id: idValue } });
      });
    } catch (error) {
      this.handleDatabaseError(error, 'delete address');
    }
  }

  async findById(id: Id): Promise<Address | null> {
    const idValue = id.getValue();
    try {
      const prismaAddress = await this.prisma.address.findUnique({
        where: { id: idValue },
      });

      if (!prismaAddress) {
        return null;
      }

      return this.mapToDomain(prismaAddress);
    } catch (error) {
      this.handleDatabaseError(error, 'find address by ID');
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
            `Address ${field} already exists`,
          );
        }
        case 'P2003': {
          // Foreign key constraint violation
          const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
          const fieldToEntityMap: Record<string, string> = {
            customerId: 'Customer',
            tenantId: 'Tenant',
          };
          const relatedEntity = fieldToEntityMap[field] || 'Related Entity';
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        case 'P2025': // Record not found
          throw new ResourceNotFoundError('Address');
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
   * Maps Prisma address to domain entity
   */
  private mapToDomain(prismaAddress: prismaAddress): Address {
    return AddressMapper.fromPersistence(prismaAddress);
  }
}
