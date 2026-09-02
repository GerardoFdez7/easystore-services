import { Id } from '@shared/aggregates/value-objects';

export class GetDashboardDTO {
  constructor(public readonly tenantId: Id) {}
}
