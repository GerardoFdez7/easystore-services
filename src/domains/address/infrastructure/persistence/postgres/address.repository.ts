import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { Prisma, Address as prismaAddress } from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@shared/errors';
import { Address, IAddressType } from '../../../aggregates/entities';
import {
  IAddressRepository,
  Owner,
} from '../../../aggregates/repositories/address.interface';
import { AddressMapper } from '../../../application/mappers';
import { Id, AddressType } from '../../../aggregates/value-objects';
import { AddressDetailsDTO } from '@shared/dtos';

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
            stateId: addressDto.stateId,
            addressType: addressDto.addressType,
            deliveryNum: addressDto.deliveryNum,
            deliveryInstructions: addressDto.deliveryInstructions,
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

  async update(id: Id, owner: Owner, updates: Address): Promise<Address> {
    const idValue = id.getValue();
    const updatesDto = AddressMapper.toDto(updates);
    try {
      const prismaAddress = await this.prisma.$transaction(async (tsx) => {
        //Update the address
        await tsx.address.update({
          where: {
            id: idValue,
            ...('tenantId' in owner
              ? { tenantId: owner.tenantId.getValue() }
              : {}),
            ...('customerId' in owner
              ? { customerId: owner.customerId.getValue() }
              : {}),
          },
          data: {
            name: updatesDto.name,
            addressLine1: updatesDto.addressLine1,
            addressLine2: updatesDto.addressLine2,
            postalCode: updatesDto.postalCode,
            city: updatesDto.city,
            countryId: updatesDto.countryId,
            stateId: updatesDto.stateId,
            addressType: updatesDto.addressType,
            deliveryNum: updatesDto.deliveryNum,
            deliveryInstructions: updatesDto.deliveryInstructions,
          },
        });

        //Return the updated address
        return await tsx.address.findUnique({
          where: { id: idValue },
        });
      });

      return this.mapToDomain(prismaAddress);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update address');
    }
  }

  async delete(id: Id, owner: Owner): Promise<void> {
    const idValue = id.getValue();
    try {
      await this.prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({
          where: {
            id: idValue,
            ...('tenantId' in owner
              ? { tenantId: owner.tenantId.getValue() }
              : {}),
            ...('customerId' in owner
              ? { customerId: owner.customerId.getValue() }
              : {}),
          },
        });

        if (!address) {
          throw new ResourceNotFoundError('Address');
        }

        //Delete the address
        await tx.address.delete({
          where: {
            id: idValue,
            ...('tenantId' in owner
              ? { tenantId: owner.tenantId.getValue() }
              : {}),
            ...('customerId' in owner
              ? { customerId: owner.customerId.getValue() }
              : {}),
          },
        });
      });
    } catch (error) {
      return this.handleDatabaseError(error, 'delete address');
    }
  }

  /**
   * Finds an address by its ID
   * @param id - The ID of the address to find
   * @returns The found address or null if not found
   */
  async findById(id: Id, owner: Owner): Promise<Address | null> {
    const idValue = id.getValue();
    try {
      const prismaAddress = await this.prisma.address.findFirst({
        where: {
          id: idValue,
          ...('tenantId' in owner
            ? { tenantId: owner.tenantId.getValue() }
            : {}),
          ...('customerId' in owner
            ? { customerId: owner.customerId.getValue() }
            : {}),
        },
      });

      if (!prismaAddress) {
        return null;
      }

      return this.mapToDomain(prismaAddress);
    } catch (error) {
      return this.handleDatabaseError(error, 'find address by id');
    }
  }

  /**
   * Finds all addresses for a given owner and address type
   * @param owner - The owner (tenant or customer) of the addresses
   * @param addressType - The type of address to find (BILLING, SHIPPING, WAREHOUSE)
   * @returns The found addresses
   */
  async findAll(
    owner: Owner,
    options?: { addressType?: AddressType },
  ): Promise<Address[]> {
    try {
      //find all addresses
      const whereClause: Prisma.AddressWhereInput = {
        ...('tenantId' in owner ? { tenantId: owner.tenantId.getValue() } : {}),
        ...('customerId' in owner
          ? { customerId: owner.customerId.getValue() }
          : {}),
      };

      if (options?.addressType) {
        whereClause.addressType = options.addressType.getValue();
      }

      const addresses = await this.prisma.address.findMany({
        where: whereClause,
      });

      //map to domain entity
      const mappedAddress = addresses.map((address) =>
        this.mapToDomain(address),
      );

      return mappedAddress;
    } catch (error) {
      return this.handleDatabaseError(error, 'find address by id');
    }
  }

  async findDetailsByIds(ids: Id[]): Promise<AddressDetailsDTO[]> {
    try {
      const idValues = ids.map((id) => id.getValue());
      const addresses = await this.prisma.address.findMany({
        where: { id: { in: idValues } },
        include: { country: true },
      });

      return addresses.map((addr) => ({
        addressId: addr.id,
        addressLine1: addr.addressLine1,
        city: addr.city,
        countryCode: addr.country?.code || '',
        postalCode: addr.postalCode || '',
      }));
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'find address details by multiple ids',
      );
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
    return AddressMapper.fromPersistence(prismaAddress as IAddressType);
  }
}
