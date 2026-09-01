import { CurrencyCodes } from '@shared/value-objects';

/** Tenant-currency lookup capability required for cart monetary responses. */
export interface ITenantCurrencyAdapter {
  getCurrency(tenantId: string): Promise<CurrencyCodes>;
}
