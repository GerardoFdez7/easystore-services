import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ValidateStoreInTenantDTO } from '@store/application/queries';
import { IStoreOwnershipAdapter } from '../../application/ports';

/** Store-bound ownership verification used by the Tenant default-store transition. */
@Injectable()
export class StoreOwnershipAdapter implements IStoreOwnershipAdapter {
  constructor(private readonly queryBus: QueryBus) {}
  async belongsToTenant(storeId: string, tenantId: string): Promise<boolean> {
    return Boolean(
      await this.queryBus.execute(
        new ValidateStoreInTenantDTO(storeId, tenantId),
      ),
    );
  }
}
