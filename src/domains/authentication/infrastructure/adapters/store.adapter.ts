import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetStoreByDomainDTO,
  ValidateStoreInTenantDTO,
} from '@store/application/queries';
import { IStoreAdapter } from '../../application/ports';

/** Translates Authentication's ownership needs to Store public query contracts. */
@Injectable()
export class StoreAdapter implements IStoreAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  getStoreByDomain(
    domain: string,
  ): Promise<{ id: string; tenantId: string } | null> {
    return this.queryBus.execute(new GetStoreByDomainDTO(domain));
  }

  validateStoreInTenant(
    storeId: string,
    tenantId: string,
  ): Promise<{ id: string; tenantId: string } | null> {
    return this.queryBus.execute(
      new ValidateStoreInTenantDTO(storeId, tenantId),
    );
  }
}
