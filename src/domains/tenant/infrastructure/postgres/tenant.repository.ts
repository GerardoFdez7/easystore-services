import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { Id } from '@shared/aggregates/value-objects';
import { TenantDTO, TenantMapper } from '../../application/mappers';
import { Tenant, ITenantType } from '../../aggregates/entities';
import { Tenant as PrismaTenant } from '.prisma/postgres';
import {
  ITenantLoginContext,
  ITenantRepository,
} from '../../aggregates/repositories/tenant.interface';
import {
  handlePrismaDatabaseError,
  TransactionManager,
} from '@shared/infrastructure/postgres';

@Injectable()
export default class TenantRepository implements ITenantRepository {
  constructor(
    private readonly prisma: PostgreService,
    private readonly transactions: TransactionManager,
  ) {}

  async create(tenant: Tenant): Promise<Tenant> {
    const tenantDto = TenantMapper.toDto(tenant);

    try {
      const prismaTenant = await this.transactions.execute(async () => {
        const tx = this.transactions.client;
        return await tx.tenant.create({
          data: {
            id: tenantDto.id,
            name: tenantDto.name,
            authIdentityId: tenantDto.authIdentityId,
            ...this.getMutableTenantData(tenantDto),
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
      const prismaTenant = await this.transactions.execute(async () => {
        const tx = this.transactions.client;
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
            ...this.getMutableTenantData(tenantDto),
          },
        });
      });

      return this.mapToDomain(prismaTenant);
    } catch (error) {
      return this.handleDatabaseError(error, 'update tenant');
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

  async resolveLoginContext(
    authIdentityId: Id,
  ): Promise<ITenantLoginContext | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { authIdentityId: authIdentityId.getValue() },
        select: {
          id: true,
          defaultStore: { select: { id: true, tenantId: true } },
        },
      });

      if (!tenant?.defaultStore || tenant.defaultStore.tenantId !== tenant.id) {
        return null;
      }

      return { tenantId: tenant.id, storeId: tenant.defaultStore.id };
    } catch (error) {
      return this.handleDatabaseError(error, 'resolve tenant login context');
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

  private getMutableTenantData(
    tenantDto: TenantDTO,
  ): Pick<
    PrismaTenant,
    | 'name'
    | 'defaultStoreId'
    | 'defaultPhoneNumberId'
    | 'defaultShippingAddressId'
    | 'defaultBillingAddressId'
  > {
    return {
      name: tenantDto.name,
      defaultStoreId: tenantDto.defaultStoreId,
      defaultPhoneNumberId: tenantDto.defaultPhoneNumberId,
      defaultShippingAddressId: tenantDto.defaultShippingAddressId,
      defaultBillingAddressId: tenantDto.defaultBillingAddressId,
    };
  }

  private mapToDomain(clientPrisma: PrismaTenant): Tenant {
    return TenantMapper.fromPersistence(clientPrisma as ITenantType);
  }
}
