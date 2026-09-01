import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { handlePrismaDatabaseError } from '@utils/prisma-error-utils';
import { Id } from '@shared/value-objects';
import { IDashboard } from '../../../aggregates/entities';
import { IAnalyticsRepository } from '../../../aggregates/repositories';
import {
  DashboardMapper,
  RawDashboardSummary,
  RawOrderTimeline,
  RawRecentOrder,
  RawTopProduct,
} from '../../../application/mappers';

@Injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly prisma: PostgreService) {}

  async getDashboard(tenantId: Id): Promise<IDashboard | undefined> {
    try {
      const tenantIdValue = tenantId.getValue();
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantIdValue },
        select: { currency: true },
      });

      if (!tenant) {
        return undefined;
      }

      const currency = tenant.currency;
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(1);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      threeMonthsAgo.setDate(
        Math.min(
          new Date(
            threeMonthsAgo.getFullYear(),
            threeMonthsAgo.getMonth() + 1,
            0,
          ).getDate(),
          1,
        ),
      );

      const summaryResult = await this.prisma.$queryRaw<RawDashboardSummary[]>`
        SELECT
          CAST(COUNT(o.id) AS INTEGER) as "totalOrders",
          COALESCE(SUM(o."totalAmount"), 0) as "totalRevenue",
          COALESCE(AVG(o."totalAmount"), 0) as "averageOrderValue",
          CAST(COUNT(DISTINCT o."customerId") AS INTEGER) as "uniqueCustomers",
          CAST(COUNT(CASE WHEN o.status = 'COMPLETED' THEN o.id END) AS INTEGER) as "completedOrders",
          CAST(COUNT(CASE WHEN o.status = 'CANCELLED' THEN o.id END) AS INTEGER) as "cancelledOrders",
          CAST(COUNT(CASE WHEN o.status = 'PROCESSING' THEN o.id END) AS INTEGER) as "processingOrders",
          CAST(COUNT(CASE WHEN o.status = 'CONFIRMED' THEN o.id END) AS INTEGER) as "confirmedOrders",
          CAST(COUNT(CASE WHEN o.status = 'SHIPPED' THEN o.id END) AS INTEGER) as "shippedOrders",
          COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o."totalAmount" ELSE 0 END), 0) as "completedRevenue",
          COALESCE(SUM(CASE WHEN o.status = 'CANCELLED' THEN o."totalAmount" ELSE 0 END), 0) as "cancelledRevenue"
        FROM sales."Order" o
        WHERE o."tenantId" = ${tenantIdValue}
        AND o."createdAt" >= ${threeMonthsAgo}
      `;

      const timelineResult = await this.prisma.$queryRaw<RawOrderTimeline[]>`
        SELECT TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
          CAST(COUNT(o.id) AS INTEGER) as "ordersCount",
          COALESCE(SUM(o."totalAmount"), 0) as revenue
        FROM sales."Order" o
        WHERE o."tenantId" = ${tenantIdValue} AND o."createdAt" >= ${threeMonthsAgo}
        GROUP BY DATE(o."createdAt") ORDER BY DATE(o."createdAt") ASC
      `;
      const recentOrdersResult = await this.prisma.$queryRaw<RawRecentOrder[]>`
        SELECT o.id as "orderId", o."orderNumber" as "orderNumber", o."createdAt" as "orderDate", c.name as "customerName",
          o."totalAmount" as "orderTotal", o.status as "orderStatus", a.city as "shippingCity"
        FROM sales."Order" o
        INNER JOIN customer."Customer" c ON c.id = o."customerId"
        INNER JOIN "common"."Address" a ON a.id = o."addressId"
        WHERE o."tenantId" = ${tenantIdValue}
        ORDER BY o."createdAt" DESC LIMIT 5
      `;
      const topProductsResult = await this.prisma.$queryRaw<RawTopProduct[]>`
        SELECT variant_id as "variantId", variant_sku as "variantSku", MAX(product_full_name) as "productName",
          MAX(product_brand) as "productBrand", MAX(variant_price) as "variantPrice",
          MAX(variant_cover) as "variantCover", MAX(product_cover) as "productCover",
          CAST(SUM(quantity_sold) AS INTEGER) as "totalQuantitySold",
          COALESCE(SUM(item_subtotal), 0) as "totalRevenue",
          CAST(COUNT(DISTINCT order_id) AS INTEGER) as "ordersCount"
        FROM sales.dashboard_sales_view
        WHERE tenant_id = ${tenantIdValue} AND order_date >= ${threeMonthsAgo}
          AND order_status IN ('COMPLETED', 'SHIPPED')
        GROUP BY variant_id, variant_sku ORDER BY "totalRevenue" DESC LIMIT 10
      `;

      return {
        summary: summaryResult[0]
          ? DashboardMapper.dashboardSummary(summaryResult[0], currency)
          : {
              totalOrders: 0,
              totalRevenue: DashboardMapper.money('0', currency),
              averageOrderValue: DashboardMapper.money('0', currency),
              uniqueCustomers: 0,
              completedOrders: 0,
              cancelledOrders: 0,
              processingOrders: 0,
              confirmedOrders: 0,
              shippedOrders: 0,
              completedRevenue: DashboardMapper.money('0', currency),
              cancelledRevenue: DashboardMapper.money('0', currency),
            },
        ordersTimeline: timelineResult.map((item) =>
          DashboardMapper.orderTimeline(item, currency),
        ),
        recentOrders: recentOrdersResult.map((item) =>
          DashboardMapper.recentOrder(item, currency),
        ),
        topProducts: topProductsResult.map((item) =>
          DashboardMapper.topProduct(item, currency),
        ),
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
