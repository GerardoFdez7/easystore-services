import { CurrencyCodes } from '../../value-objects';

export interface IStoreBase {
  tenantId: string;
  name?: string;
  domain?: string;
  logo?: string;
  description?: string;
  currency?: CurrencyCodes;
}

export interface IStoreSystem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreType extends IStoreBase, IStoreSystem {}
