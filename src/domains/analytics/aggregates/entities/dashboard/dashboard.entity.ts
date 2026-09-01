import { Entity, EntityProps } from '@shared/entity.base';
import { Id } from '@shared/value-objects';
import { IDashboardBase } from './dashboard.attributes';

export interface IDashboardProps extends EntityProps, IDashboardBase {
  id: Id;
  tenantId: Id;
}

export class Dashboard extends Entity<IDashboardProps> {
  private constructor(props: IDashboardProps) {
    super(props);
  }

  static create(props: IDashboardProps): Dashboard {
    return new Dashboard(props);
  }

  static reconstitute(props: IDashboardProps): Dashboard {
    return new Dashboard(props);
  }
}
