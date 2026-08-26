import { IDashboard } from '../../../aggregates/entities';
import { DashboardDTO } from './dashboard.dto';

/** Maps dashboard analytics values to the application response contract. */
export class DashboardMapper {
  static toDto(dashboard: IDashboard): DashboardDTO {
    return {
      summary: { ...dashboard.summary },
      ordersTimeline: dashboard.ordersTimeline.map((item) => ({ ...item })),
      recentOrders: dashboard.recentOrders.map((item) => ({ ...item })),
      topProducts: dashboard.topProducts.map((item) => ({ ...item })),
    };
  }
}
