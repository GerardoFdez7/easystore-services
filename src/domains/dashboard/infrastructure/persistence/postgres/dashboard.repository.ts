import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  DashboardDataType,
  DashboardSummaryType,
  OrderTimelineType,
  RecentOrderType,
  TopProductType,
} from '../../../presentation/graphql/types/total-sales.type';
import IDashboardRepository from '../../../aggregates/repositories/dashboard.interface';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PostgreService) {}

  async getDashboardData(tenantId: string): Promise<DashboardDataType> {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const summaryResult = await this.prisma.$queryRaw<DashboardSummaryType[]>`
        SELECT 
          CAST(COUNT(DISTINCT order_id) AS INTEGER) as total_orders,
          CAST(COALESCE(SUM(order_total), 0) AS FLOAT) as total_revenue,
          CAST(COALESCE(AVG(order_total), 0) AS FLOAT) as average_order_value,
          CAST(COUNT(DISTINCT customer_id) AS INTEGER) as unique_customers,
          CAST(COUNT(DISTINCT CASE WHEN order_status = 'COMPLETED' THEN order_id END) AS INTEGER) as completed_orders,
          CAST(COUNT(DISTINCT CASE WHEN order_status = 'CANCELLED' THEN order_id END) AS INTEGER) as cancelled_orders,
          CAST(COUNT(DISTINCT CASE WHEN order_status = 'PROCESSING' THEN order_id END) AS INTEGER) as processing_orders,
          CAST(COUNT(DISTINCT CASE WHEN order_status = 'CONFIRMED' THEN order_id END) AS INTEGER) as confirmed_orders,
          CAST(COUNT(DISTINCT CASE WHEN order_status = 'SHIPPED' THEN order_id END) AS INTEGER) as shipped_orders,
          CAST(COALESCE(SUM(CASE WHEN order_status = 'COMPLETED' THEN order_total ELSE 0 END), 0) AS FLOAT) as completed_revenue,
          CAST(COALESCE(SUM(CASE WHEN order_status = 'CANCELLED' THEN order_total ELSE 0 END), 0) AS FLOAT) as cancelled_revenue
        FROM sales.dashboard_sales_view
        WHERE tenant_id = ${tenantId}
        AND order_date >= ${threeMonthsAgo}
      `;

      const timelineResult = await this.prisma.$queryRaw<OrderTimelineType[]>`
        SELECT 
          TO_CHAR(order_date_only, 'YYYY-MM-DD') as date,
          CAST(COUNT(DISTINCT order_id) AS INTEGER) as orders_count,
          CAST(COALESCE(SUM(order_total), 0) AS FLOAT) as revenue
        FROM sales.dashboard_sales_view
        WHERE tenant_id = ${tenantId}
        AND order_date >= ${threeMonthsAgo}
        GROUP BY order_date_only
        ORDER BY order_date_only ASC
      `;

      const recentOrdersResult = await this.prisma.$queryRaw<RecentOrderType[]>`
        SELECT DISTINCT ON (order_id)
          order_id,
          order_number,
          order_date,
          customer_name,
          CAST(order_total AS FLOAT) as order_total,
          order_status,
          shipping_city
        FROM sales.dashboard_sales_view
        WHERE tenant_id = ${tenantId}
        ORDER BY order_id, order_date DESC
        LIMIT 5
      `;

      const topProductsResult = await this.prisma.$queryRaw<TopProductType[]>`
        SELECT 
          variant_id,
          variant_sku,
          MAX(product_name) as product_name,
          MAX(product_brand) as product_brand,
          CAST(MAX(variant_price) AS FLOAT) as variant_price,
          MAX(variant_cover) as variant_cover,
          MAX(product_cover) as product_cover,
          CAST(SUM(quantity_sold) AS INTEGER) as total_quantity_sold,
          CAST(COALESCE(SUM(item_subtotal), 0) AS FLOAT) as total_revenue,
          CAST(COUNT(DISTINCT order_id) AS INTEGER) as orders_count
        FROM sales.dashboard_sales_view
        WHERE tenant_id = ${tenantId}
        AND order_date >= ${threeMonthsAgo}
        AND order_status IN ('COMPLETED', 'SHIPPED')
        GROUP BY variant_id, variant_sku
        ORDER BY total_revenue DESC
        LIMIT 10
      `;

      const summary: DashboardSummaryType =
        summaryResult.length > 0
          ? summaryResult[0]
          : {
              total_orders: 0,
              total_revenue: 0,
              average_order_value: 0,
              unique_customers: 0,
              completed_orders: 0,
              cancelled_orders: 0,
              processing_orders: 0,
              confirmed_orders: 0,
              shipped_orders: 0,
              completed_revenue: 0,
              cancelled_revenue: 0,
            };

      return {
        summary,
        ordersTimeline: timelineResult,
        recentOrders: recentOrdersResult,
        topProducts: topProductsResult,
      };
    } catch (error: unknown) {
      this.handleDatabaseError(error, 'find dashboard data');
    }
  }

  private handleDatabaseError(error: unknown, context: string): never {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error);

    throw new Error(`Database error (${context}): ${message}`);
  }
}
