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
  totalRevenue: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  completedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  completedRevenue: number;
  cancelledRevenue: number;
}

export interface IOrderTimeline {
  date: string;
  ordersCount: number;
  revenue: number;
}

export interface IRecentOrder {
  orderId: string;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  orderTotal: number;
  orderStatus: string;
  shippingCity?: string;
}

export interface ITopProduct {
  variantId: string;
  variantSku: string;
  productName: string;
  productBrand?: string;
  variantPrice: number;
  variantCover?: string;
  productCover?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  ordersCount: number;
}

export type IDashboard = IDashboardType;
