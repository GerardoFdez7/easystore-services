import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ResolveTenantLoginContextDTO } from '../../../tenant/application/queries';
import { ITenantAdapter, ITenantLoginContext } from '../../application/ports';

@Injectable()
export class TenantAdapter implements ITenantAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  resolveTenantLoginContext(
    authIdentityId: string,
  ): Promise<ITenantLoginContext | null> {
    return this.queryBus.execute(
      new ResolveTenantLoginContextDTO(authIdentityId),
    );
  }
}
