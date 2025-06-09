import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  UniqueConstraintViolationError,
  DatabaseOperationError,
  ResourceNotFoundError,
} from '@domains/errors';
import { Id, Name } from '@domains/value-objects';
import { TenantMapper } from '../../../application/mappers';
import { Tenant } from '../../../aggregates/entities';
import { Tenant as PrismaTenant } from '.prisma/postgres';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PostgreService) {}

  // Save (create or update) a tenant
  async save(tenant: Tenant): Promise<Tenant> {
    const id = tenant.get('id')?.getValue();
    const data = TenantMapper.toDto(tenant) as Omit<
      PrismaTenant,
      'id' | 'createdAt' | 'updatedAt'
    >;

    try {
      let prismaTenant: PrismaTenant;
      if (id) {
        // Try to update existing tenant
        prismaTenant = await this.prisma.tenant.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new tenant
        prismaTenant = await this.prisma.tenant.create({
          data: data as PrismaTenant,
        });
      }
      return this.mapToDomain(prismaTenant);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        const prismaError = error as { meta?: { target?: string[] } };
        const field = prismaError.meta?.target?.[0] || 'unknown field';
        throw new UniqueConstraintViolationError(field);
      }
      // Handle cases where an update is attempted on a non-existent record
      if ((error as { code?: string }).code === 'P2025') {
        throw new ResourceNotFoundError('Tenant', id?.toString());
      }
      throw new DatabaseOperationError(
        id ? 'update' : 'create',
        (error as Error).message,
        error as Error,
      );
    }
  }

  // Delete a tenant by ID
  async delete(id: Id): Promise<void> {
    try {
      await this.prisma.tenant.delete({
        where: { id: id.getValue() },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new ResourceNotFoundError('Tenant', id.getValue().toString());
      }
      throw new DatabaseOperationError(
        'delete',
        (error as Error).message,
        error as Error,
      );
    }
  }

  // Find a tenant by Business Name
  async findByBusinessName(businessNameObj: Name): Promise<Tenant | null> {
    const businessName = businessNameObj.getValue();
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { businessName },
      });
      return tenant ? this.mapToDomain(tenant) : null;
    } catch (error) {
      throw new DatabaseOperationError(
        'findByBusinessName',
        (error as Error).message,
        error as Error,
      );
    }
  }

  // Map from database model to domain entity using the centralized mapping approach
  private mapToDomain(clientPrisma: PrismaTenant): Tenant {
    return TenantMapper.fromPersistence(clientPrisma);
  }
}
