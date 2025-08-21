import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  UniqueConstraintViolationError,
  DatabaseOperationError,
  ResourceNotFoundError,
  ForeignKeyConstraintViolationError,
} from '@domains/errors';
import { Id } from '@domains/value-objects';
import { TenantMapper } from '../../../application/mappers';
import { Tenant, ITenantType } from '../../../aggregates/entities';
import { Prisma, Tenant as PrismaTenant } from '.prisma/postgres';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';

@Injectable()
export default class TenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PostgreService) {}

  async create(tenant: Tenant): Promise<Tenant> {
    const tenantDto = TenantMapper.toDto(tenant);

    try {
      const prismaTenant = await this.prisma.$transaction(async (tx) => {
        return await tx.tenant.create({
          data: {
            id: tenantDto.id,
            businessName: tenantDto.businessName,
            ownerName: tenantDto.ownerName,
            domain: tenantDto.domain,
            logo: tenantDto.logo,
            description: tenantDto.description,
            currency: tenantDto.currency,
            authIdentityId: tenantDto.authIdentityId,
          },
        });
      });
      return this.mapToDomain(prismaTenant);
    } catch (error) {
      return this.handleDatabaseError(error, 'create tenant');
    }
  }

  async update(id: Id, tenant: Tenant): Promise<Tenant> {
    const idValue = id.getValue();
    const tenantDto = TenantMapper.toDto(tenant);

    try {
      const prismaTenant = await this.prisma.$transaction(async (tx) => {
        await tx.tenant.findUniqueOrThrow({
          where: {
            id: idValue,
          },
        });

        return await tx.tenant.update({
          where: {
            id: idValue,
          },
          data: {
            businessName: tenantDto.businessName,
            ownerName: tenantDto.ownerName,
            domain: tenantDto.domain,
            logo: tenantDto.logo,
            description: tenantDto.description,
            currency: tenantDto.currency,
          },
        });
      });

      return this.mapToDomain(prismaTenant);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update tenant');
    }
  }

  async delete(id: Id): Promise<void> {
    const idValue = id.getValue();

    try {
      await this.prisma.$transaction(async (tx) => {
        const existingTenant = await tx.tenant.findUnique({
          where: {
            id: idValue,
          },
        });

        if (!existingTenant) {
          throw new ResourceNotFoundError('Tenant', idValue);
        }

        await tx.tenant.delete({
          where: {
            id: idValue,
          },
        });
      });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'delete tenant');
    }
  }

  async findByAuthIdentityId(authIdentityId: Id): Promise<Tenant | null> {
    const authIdentityIdValue = authIdentityId.getValue();
    try {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          authIdentityId: authIdentityIdValue,
        },
      });

      return tenant ? this.mapToDomain(tenant) : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'find tenant by auth identity id');
    }
  }

  async findById(id: Id): Promise<Tenant | null> {
    const idValue = id.getValue();
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: {
          id: idValue,
        },
      });

      return tenant ? this.mapToDomain(tenant) : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'find tenant by id');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          throw new UniqueConstraintViolationError(
            field,
            `Tenant ${field} already exists`,
          );
        }
        case 'P2003': {
          const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
          const fieldToEntityMap: Record<string, string> = {
            authIdentityId: 'Auth Identity',
          };
          const relatedEntity = fieldToEntityMap[field] || 'Related Entity';
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        case 'P2025':
          throw new ResourceNotFoundError('Tenant');
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

  private mapToDomain(clientPrisma: PrismaTenant): Tenant {
    return TenantMapper.fromPersistence(clientPrisma as ITenantType);
  }
}
