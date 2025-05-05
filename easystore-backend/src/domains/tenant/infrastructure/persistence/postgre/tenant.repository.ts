import { Injectable } from '@nestjs/common';
import { PostgreService } from '@infrastructure/database/postgre/postgre.service';
import { Tenant } from '../../../aggregates/entities/tenant.entity';
import { Tenant as PrismaTenant } from '.prisma/postgres';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import {
  Id,
  BusinessName,
  Email,
} from '../../../aggregates/value-objects/index';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PostgreService) {}

  // Save (create or update) a tenant
  async save(tenant: Tenant): Promise<Tenant> {
    const id = tenant.get('id')?.getValue?.();
    const email = tenant.get('email').getValue();
    const businessName = tenant.get('businessName').getValue();
    const ownerName = tenant.get('ownerName').getValue();
    const hashedPassword = await tenant.get('password').getHashedValue();
    const now = new Date();

    try {
      let prismaTenant: PrismaTenant;
      if (id) {
        // Try to update existing tenant
        prismaTenant = await this.prisma.tenant.update({
          where: { id },
          data: {
            businessName,
            ownerName,
            email,
            password: hashedPassword,
            updatedAt: now,
          },
        });
      } else {
        // Create new tenant
        prismaTenant = await this.prisma.tenant.create({
          data: {
            businessName,
            ownerName,
            email,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          },
        });
      }
      return this.mapToDomain(prismaTenant);
    } catch (error) {
      // Translate ORM exceptions to domain exceptions with Prisma error codes
      if ((error as { code?: string }).code === 'P2002') {
        const prismaError = error as { meta?: { target?: string[] } };

        if (prismaError.meta?.target?.includes('email')) {
          throw new Error('Email is already in use');
        }
        if (prismaError.meta?.target?.includes('businessName')) {
          throw new Error('Business name is already in use');
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

  // Find a tenant by Email
  async findByEmail(emailObj: Email): Promise<Tenant | null> {
    const email = emailObj.getValue();
    const tenant = await this.prisma.tenant.findUnique({
      where: { email },
    });
    return tenant ? this.mapToDomain(tenant) : null;
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
    return Tenant.fromPrisma(clientPrisma);
  }
}
