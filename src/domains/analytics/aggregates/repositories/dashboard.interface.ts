import { Id } from '@shared/value-objects';
import { IDashboard } from '../entities';

/** Read-only analytics retrieval. */
export interface IAnalyticsRepository {
  getDashboard(tenantId: Id): Promise<IDashboard | undefined>;
}
