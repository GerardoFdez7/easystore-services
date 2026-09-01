import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { handlePrismaDatabaseError } from '@utils/prisma-error-utils';
import { Prisma, Address as prismaAddress } from '.prisma/postgres';
import { ResourceNotFoundError } from '@shared/errors';
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
          where: this.getOwnerWhere(idValue, owner),
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
      return this.handleDatabaseError(error, 'update address');
    }
  }

  async delete(id: Id, owner: Owner): Promise<void> {
    const idValue = id.getValue();
    try {
      await this.prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({
          where: this.getOwnerWhere(idValue, owner),
        });

        if (!address) {
          throw new ResourceNotFoundError('Address');
        }

        //Delete the address
        await tx.address.delete({
          where: this.getOwnerWhere(idValue, owner),
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
        where: this.getOwnerWhere(idValue, owner),
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
   * Finds all addresses for a given owner with pagination and filtering options
   * @param owner - The owner (tenant or customer) of the addresses
   * @param options - Optional query parameters for pagination and filtering
   * @returns Promise that resolves to paginated addresses with total count and hasMore flag
   */
  async findAll(
    owner: Owner,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      addressType?: AddressType;
    },
  ): Promise<{ addresses: Address[]; total: number; hasMore: boolean }> {
    try {
      // Build where clause
      const whereClause: Prisma.AddressWhereInput = {
        tenantId: owner.tenantId.getValue(),
        ...('customerId' in owner && owner.customerId
          ? { customerId: owner.customerId.getValue() }
          : {}),
      };

      if (options?.addressType) {
        whereClause.addressType = options.addressType.getValue();
      }

      if (options?.name) {
        whereClause.OR = [
          { name: { contains: options.name, mode: 'insensitive' } },
          { addressLine1: { contains: options.name, mode: 'insensitive' } },
          { addressLine2: { contains: options.name, mode: 'insensitive' } },
          { city: { contains: options.name, mode: 'insensitive' } },
        ];
      }

      // Get total count
      const total = await this.prisma.address.count({
        where: whereClause,
      });

      // Set default pagination values
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      // Get paginated addresses
      const addresses = await this.prisma.address.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      });

      // Map to domain entities
      const mappedAddresses = addresses.map((address) =>
        this.mapToDomain(address),
      );

      // Calculate hasMore
      const hasMore = skip + addresses.length < total;

      return {
        addresses: mappedAddresses,
        total,
        hasMore,
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'find all addresses');
    }
  }

  async findDetailsByIds(
    ids: Id[],
    tenantId: Id,
  ): Promise<AddressDetailsDTO[]> {
    try {
      const idValues = ids.map((id) => id.getValue());
      const addresses = await this.prisma.address.findMany({
        where: { id: { in: idValues }, tenantId: tenantId.getValue() },
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
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Address',
      foreignKeyEntities: {
        customerId: 'Customer',
        tenantId: 'Tenant',
      },
    });
  }

  private getOwnerWhere(
    id: string,
    owner: Owner,
  ): Prisma.AddressWhereUniqueInput {
    return {
      id,
      tenantId: owner.tenantId.getValue(),
      ...('customerId' in owner && owner.customerId
        ? { customerId: owner.customerId.getValue() }
        : {}),
    };
  }

  /**
   * Maps Prisma address to domain entity
   */
  private mapToDomain(prismaAddress: prismaAddress): Address {
    return AddressMapper.fromPersistence(prismaAddress as IAddressType);
  }
}
