import { Id } from '@shared/value-objects';

export class GetDashboardDTO {
  constructor(public readonly tenantId: Id) {}
}
