import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { ResourceNotFoundError } from '@shared/infrastructure/postgres/errors';
import { Id } from '@shared/aggregates/value-objects';
import { TenantMapper } from '../../application/mappers';
import { Tenant, ITenantType } from '../../aggregates/entities';
import { Tenant as PrismaTenant } from '.prisma/postgres';
import { ITenantRepository } from '../../aggregates/repositories/tenant.interface';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { Domain } from '../../aggregates/value-objects/index';

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

  async getTenantIdByDomain(domain: Domain): Promise<string | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { domain: domain.getValue() },
      });
      return tenant ? tenant.id : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'Get tenant id by domain.');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Tenant',
      foreignKeyEntities: {
        authIdentityId: 'Auth Identity',
      },
    });
  }

  private mapToDomain(clientPrisma: PrismaTenant): Tenant {
    return TenantMapper.fromPersistence(clientPrisma as ITenantType);
  }
}
