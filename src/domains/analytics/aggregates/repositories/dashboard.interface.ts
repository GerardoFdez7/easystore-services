import { Id } from '@shared/aggregates/value-objects';
import { IDashboard } from '../entities';

/** Read-only analytics retrieval. */
export interface IAnalyticsRepository {
  getDashboard(storeId: Id): Promise<IDashboard | undefined>;
}
