import { ITenantBase } from '../../../aggregates/entities';

export class TenantSingUpDTO implements ITenantBase {
  businessName: string;
  ownerName: string;
  domain: string;
  logo?: string | null;
  description?: string | null;
  currency: string;
  authIdentityId: number;
  constructor(public readonly data: ITenantBase) {
    Object.assign(this, data);
  }
}
