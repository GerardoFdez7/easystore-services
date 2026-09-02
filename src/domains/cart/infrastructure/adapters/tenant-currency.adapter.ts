import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Currency, CurrencyCodes } from '@shared/aggregates/value-objects';
import { GetTenantByIdDTO } from '../../../tenant/application/queries';
import { ITenantCurrencyAdapter } from '../../application/ports';

@Injectable()
export class TenantCurrencyAdapter implements ITenantCurrencyAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  async getCurrency(tenantId: string): Promise<CurrencyCodes> {
    const tenant: unknown = await this.queryBus.execute(
      new GetTenantByIdDTO(tenantId),
    );

    if (
      !tenant ||
      typeof tenant !== 'object' ||
      !('currency' in tenant) ||
      typeof tenant.currency !== 'string'
    ) {
      throw new TypeError(
        'Tenant currency lookup returned an invalid response.',
      );
    }

    return Currency.create(tenant.currency).getValue();
  }
}
