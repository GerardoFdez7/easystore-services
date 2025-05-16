import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { TenantMapper } from '../../../application/mappers';
import { Tenant } from '../../../aggregates/entities';
import { Tenant as PrismaTenant } from '.prisma/postgres';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { Id, BusinessName } from '../../../aggregates/value-objects';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PostgreService) {}

  // Save (create or update) a tenant
  async save(tenant: Tenant): Promise<Tenant> {
    const id = tenant.get('id')?.getValue();
    const data = TenantMapper.toDto(tenant) as PrismaTenant;

    try {
      let prismaTenant: PrismaTenant;
      if (id) {
        // Try to update existing tenant
        prismaTenant = await this.prisma.tenant.update({
          where: { id },
          data,
        });
      } else {
        // Create new tenant
        prismaTenant = await this.prisma.tenant.create({
          data,
        });
      }
      return this.mapToDomain(prismaTenant);
    } catch (error) {
      // Translate ORM exceptions to domain exceptions with Prisma error codes
      if ((error as { code?: string }).code === 'P2002') {
        const prismaError = error as { meta?: { target?: string[] } };
        const target = prismaError.meta?.target?.[0];

        switch (target) {
          case 'businessName':
            throw new Error('Business name is already in use');
          case 'domain':
            throw new Error('Domain is already in use');
          case 'authIdentityId':
            throw new Error('Auth identity is already linked to a tenant');
          case 'defaultPhoneNumberId':
            throw new Error(
              'Default phone number is already linked to a tenant',
            );
          case 'defaultShippingAddressId':
            throw new Error(
              'Default shipping address is already linked to a tenant',
            );
          case 'defaultBillingAddressId':
            throw new Error(
              'Default billing address is already linked to a tenant',
            );
          default:
            // Handle other potential unique constraints if any
            throw new Error(`Unique constraint failed on field: ${target}`);
        }
      }
      throw error;
    }
  }

  // Delete a tenant by ID
  async delete(id: Id): Promise<void> {
    await this.prisma.tenant.delete({
      where: { id: Number(id) },
    });
  }

  // Find a tenant by Business Name
  async findByBusinessName(
    businessNameObj: BusinessName,
  ): Promise<Tenant | null> {
    const businessName = businessNameObj.getValue();
    const tenant = await this.prisma.tenant.findUnique({
      where: { businessName },
    });
    return tenant ? this.mapToDomain(tenant) : null;
  }

  // Map from database model to domain entity using the centralized mapping approach
  private mapToDomain(clientPrisma: PrismaTenant): Tenant {
    return TenantMapper.fromPersistence(clientPrisma);
  }
}
