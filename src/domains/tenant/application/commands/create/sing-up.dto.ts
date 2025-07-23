import { ITenantBase } from '../../../aggregates/entities';

export class TenantSingUpDTO {
  constructor(public readonly data: ITenantBase) {}
}
