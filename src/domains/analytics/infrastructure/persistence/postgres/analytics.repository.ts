import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { handlePrismaDatabaseError } from '@utils/prisma-error-utils';
import {
  IDashboard,
  IDashboardSummary,
  IOrderTimeline,
  IRecentOrder,
  ITopProduct,
} from '../../../aggregates/entities';
import { IAnalyticsRepository } from '../../../aggregates/repositories';
import { Id } from '@shared/value-objects';

@Injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly prisma: PostgreService) {}

  async getDashboard(tenantId: Id): Promise<IDashboard> {
    try {
      const tenantIdValue = tenantId.getValue();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const summaryResult = await this.prisma.$queryRaw<IDashboardSummary[]>`
        SELECT
          CAST(COUNT(o.id) AS INTEGER) as "totalOrders",
          CAST(COALESCE(SUM(o."totalAmount"), 0) AS FLOAT) as "totalRevenue",
          CAST(COALESCE(AVG(o."totalAmount"), 0) AS FLOAT) as "averageOrderValue",
          CAST(COUNT(DISTINCT o."customerId") AS INTEGER) as "uniqueCustomers",
          CAST(COUNT(CASE WHEN o.status = 'COMPLETED' THEN o.id END) AS INTEGER) as "completedOrders",
          CAST(COUNT(CASE WHEN o.status = 'CANCELLED' THEN o.id END) AS INTEGER) as "cancelledOrders",
          CAST(COUNT(CASE WHEN o.status = 'PROCESSING' THEN o.id END) AS INTEGER) as "processingOrders",
          CAST(COUNT(CASE WHEN o.status = 'CONFIRMED' THEN o.id END) AS INTEGER) as "confirmedOrders",
          CAST(COUNT(CASE WHEN o.status = 'SHIPPED' THEN o.id END) AS INTEGER) as "shippedOrders",
          CAST(COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o."totalAmount" ELSE 0 END), 0) AS FLOAT) as "completedRevenue",
          CAST(COALESCE(SUM(CASE WHEN o.status = 'CANCELLED' THEN o."totalAmount" ELSE 0 END), 0) AS FLOAT) as "cancelledRevenue"
        FROM sales."Order" o
        WHERE o."tenantId" = ${tenantIdValue}
        AND o."createdAt" >= ${threeMonthsAgo}
      `;

      const timelineResult = await this.prisma.$queryRaw<IOrderTimeline[]>`
        SELECT TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
          CAST(COUNT(o.id) AS INTEGER) as "ordersCount",
          CAST(COALESCE(SUM(o."totalAmount"), 0) AS FLOAT) as revenue
        FROM sales."Order" o
        WHERE o."tenantId" = ${tenantIdValue} AND o."createdAt" >= ${threeMonthsAgo}
        GROUP BY DATE(o."createdAt") ORDER BY DATE(o."createdAt") ASC
      `;
      const recentOrdersResult = await this.prisma.$queryRaw<IRecentOrder[]>`
        SELECT o.id as "orderId", o."orderNumber" as "orderNumber", o."createdAt" as "orderDate", c.name as "customerName",
          CAST(o."totalAmount" AS FLOAT) as "orderTotal", o.status as "orderStatus", a.city as "shippingCity"
        FROM sales."Order" o
        INNER JOIN customer."Customer" c ON c.id = o."customerId"
        INNER JOIN "common"."Address" a ON a.id = o."addressId"
        WHERE o."tenantId" = ${tenantIdValue}
        ORDER BY o."createdAt" DESC LIMIT 5
      `;
      const topProductsResult = await this.prisma.$queryRaw<ITopProduct[]>`
        SELECT variant_id as "variantId", variant_sku as "variantSku", MAX(product_full_name) as "productName",
          MAX(product_brand) as "productBrand", CAST(MAX(variant_price) AS FLOAT) as "variantPrice",
          MAX(variant_cover) as "variantCover", MAX(product_cover) as "productCover",
          CAST(SUM(quantity_sold) AS INTEGER) as "totalQuantitySold",
          CAST(COALESCE(SUM(item_subtotal), 0) AS FLOAT) as "totalRevenue",
          CAST(COUNT(DISTINCT order_id) AS INTEGER) as "ordersCount"
        FROM sales.dashboard_sales_view
        WHERE tenant_id = ${tenantIdValue} AND order_date >= ${threeMonthsAgo}
          AND order_status IN ('COMPLETED', 'SHIPPED')
        GROUP BY variant_id, variant_sku ORDER BY "totalRevenue" DESC LIMIT 10
      `;

      return {
        summary: summaryResult[0] ?? {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          uniqueCustomers: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          processingOrders: 0,
          confirmedOrders: 0,
          shippedOrders: 0,
          completedRevenue: 0,
          cancelledRevenue: 0,
        },
        ordersTimeline: timelineResult,
        recentOrders: recentOrdersResult,
        topProducts: topProductsResult,
      };
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  private handleDatabaseError(error: unknown): never {
    return handlePrismaDatabaseError(error, 'Dashboard', {
      resource: 'Dashboard',
    });
  }
}
