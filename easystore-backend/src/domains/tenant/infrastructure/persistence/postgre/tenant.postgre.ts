import { Injectable } from '@nestjs/common';
import { PostgreService } from '@infrastructure/database/postgre/postgre.service';
import { Tenant } from '../../../aggregates/entities/tenant.entity';
import { Tenant as PrismaTenant } from '.prisma/postgres';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.repository.interface';
import { BusinessName, Email } from '../../../aggregates/value-objects/index';

@Injectable()
export class TenantPostgreRepository implements ITenantRepository {
  constructor(private readonly prisma: PostgreService) {}

  // Create a new tenant
  async create(tenant: Tenant): Promise<Tenant> {
    try {
      const email = tenant.get('email').getValue();
      const businessName = tenant.get('businessName').getValue();
      const ownerName = tenant.get('ownerName').getValue();
      const hashedPassword = await tenant.get('password').getHashedValue();

      const createdTenant = await this.prisma.tenant.create({
        data: {
          businessName,
          ownerName,
          email,
          password: hashedPassword,
        },
      });

      return this.mapToDomain(createdTenant);
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

  // Find a tenant by Email
  async findByEmail(emailStr: string): Promise<Tenant | null> {
    const email = Email.create(emailStr);
    const tenant = await this.prisma.tenant.findUnique({
      where: { email: email.getValue() },
    });
    return tenant ? this.mapToDomain(tenant) : null;
  }

  // Find a tenant by Business Name
  async findByBusinessName(businessNameStr: string): Promise<Tenant | null> {
    const businessName = BusinessName.create(businessNameStr);
    const tenant = await this.prisma.tenant.findUnique({
      where: { businessName: businessName.getValue() },
    });
    return tenant ? this.mapToDomain(tenant) : null;
  }

  // Map from database model to domain entity using the centralized mapping approach
  private mapToDomain(clientPrisma: PrismaTenant): Tenant {
    return Tenant.fromPrisma(clientPrisma);
  }
}
