import { Tenant } from '../entities/tenant.entity';

export interface ITenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  findByEmail(email: string): Promise<Tenant | null>;
  findByBusinessName(businessName: string): Promise<Tenant | null>;
}
