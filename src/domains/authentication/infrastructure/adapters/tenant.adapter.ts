import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TenantSingUpDTO } from '../../../tenant/application/commands';
import { GetTenantByAuthIdentityDTO } from '../../../tenant/application/queries';
import {
  ITenantAdapter,
  ITenantProvisioningData,
} from '../../application/ports';

@Injectable()
export class TenantAdapter implements ITenantAdapter {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async provisionTenant(data: ITenantProvisioningData): Promise<void> {
    await this.commandBus.execute(new TenantSingUpDTO(data));
  }

  async getTenantIdByAuthIdentityId(
    authIdentityId: string,
  ): Promise<string | null> {
    return this.queryBus.execute(
      new GetTenantByAuthIdentityDTO(authIdentityId),
    );
  }
}
