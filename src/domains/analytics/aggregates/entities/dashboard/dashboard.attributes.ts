import { IMoney } from '@shared/aggregates/value-objects';

export interface IDashboardBase {
  summary: IDashboardSummary;
  ordersTimeline: IOrderTimeline[];
  recentOrders: IRecentOrder[];
  topProducts: ITopProduct[];
}

export interface IDashboardType extends IDashboardBase {
  readonly dashboard?: never;
}

export interface IDashboardSummary {
  totalOrders: number;
  totalRevenue: IMoney;
  averageOrderValue: IMoney;
  uniqueCustomers: number;
  completedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  completedRevenue: IMoney;
  cancelledRevenue: IMoney;
}

export interface IOrderTimeline {
  date: string;
  ordersCount: number;
  revenue: IMoney;
}

export interface IRecentOrder {
  orderId: string;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  orderTotal: IMoney;
  orderStatus: string;
  shippingCity?: string;
}

export interface ITopProduct {
  variantId: string;
  variantSku: string;
  productName: string;
  productBrand?: string;
  variantPrice: IMoney;
  variantCover?: string;
  productCover?: string;
  totalQuantitySold: number;
  totalRevenue: IMoney;
  ordersCount: number;
}

export type IDashboard = IDashboardType;
