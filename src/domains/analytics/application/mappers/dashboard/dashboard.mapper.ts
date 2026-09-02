import {
  IDashboard,
  IDashboardSummary,
  IOrderTimeline,
  IRecentOrder,
  ITopProduct,
} from '../../../aggregates/entities';
import { IMoney, Money } from '@shared/aggregates/value-objects';
import { DashboardDTO } from './dashboard.dto';

interface DecimalLike {
  toFixed(): string;
}

export type DashboardDecimal = DecimalLike | string;

export interface RawDashboardSummary
  extends Omit<
    IDashboardSummary,
    | 'totalRevenue'
    | 'averageOrderValue'
    | 'completedRevenue'
    | 'cancelledRevenue'
  > {
  totalRevenue: DashboardDecimal;
  averageOrderValue: DashboardDecimal;
  completedRevenue: DashboardDecimal;
  cancelledRevenue: DashboardDecimal;
}

export interface RawOrderTimeline extends Omit<IOrderTimeline, 'revenue'> {
  revenue: DashboardDecimal;
}

export interface RawRecentOrder extends Omit<IRecentOrder, 'orderTotal'> {
  orderTotal: DashboardDecimal;
}

export interface RawTopProduct
  extends Omit<ITopProduct, 'variantPrice' | 'totalRevenue'> {
  variantPrice: DashboardDecimal;
  totalRevenue: DashboardDecimal;
}

/** Maps dashboard analytics values to the application response contract. */
export class DashboardMapper {
  static dashboardSummary(
    value: RawDashboardSummary,
    currency: string,
  ): IDashboardSummary {
    return {
      ...value,
      totalRevenue: this.money(value.totalRevenue, currency),
      averageOrderValue: this.money(value.averageOrderValue, currency),
      completedRevenue: this.money(value.completedRevenue, currency),
      cancelledRevenue: this.money(value.cancelledRevenue, currency),
    };
  }

  static orderTimeline(
    value: RawOrderTimeline,
    currency: string,
  ): IOrderTimeline {
    return { ...value, revenue: this.money(value.revenue, currency) };
  }

  static recentOrder(value: RawRecentOrder, currency: string): IRecentOrder {
    return { ...value, orderTotal: this.money(value.orderTotal, currency) };
  }

  static topProduct(value: RawTopProduct, currency: string): ITopProduct {
    return {
      ...value,
      variantPrice: this.money(value.variantPrice, currency),
      totalRevenue: this.money(value.totalRevenue, currency),
    };
  }

  static toDto(dashboard: IDashboard): DashboardDTO {
    return {
      summary: { ...dashboard.summary },
      ordersTimeline: dashboard.ordersTimeline.map((item) => ({ ...item })),
      recentOrders: dashboard.recentOrders.map((item) => ({ ...item })),
      topProducts: dashboard.topProducts.map((item) => ({ ...item })),
    };
  }

  static money(value: DashboardDecimal, currency: string): IMoney {
    return Money.create(
      typeof value === 'string' ? value : value.toFixed(),
      currency,
    ).getValue();
  }
}
