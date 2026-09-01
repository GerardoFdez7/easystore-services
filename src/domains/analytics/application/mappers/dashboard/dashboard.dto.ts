import {
  IDashboard,
  IDashboardSummary,
  IOrderTimeline,
  IRecentOrder,
  ITopProduct,
} from '../../../aggregates/entities';

export interface DashboardDTO extends IDashboard {
  summary: IDashboardSummary;
  ordersTimeline: IOrderTimeline[];
  recentOrders: IRecentOrder[];
  topProducts: ITopProduct[];
}
