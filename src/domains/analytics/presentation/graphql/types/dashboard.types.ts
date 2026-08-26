import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { DashboardDTO } from '../../../application/mappers/dashboard/dashboard.dto';

@ObjectType('DashboardSummary')
export class DashboardSummaryType {
  @Field(() => Int) totalOrders: number;
  @Field(() => Float) totalRevenue: number;
  @Field(() => Float)
  averageOrderValue: number;
  @Field(() => Int) uniqueCustomers: number;
  @Field(() => Int) completedOrders: number;
  @Field(() => Int) cancelledOrders: number;
  @Field(() => Int) processingOrders: number;
  @Field(() => Int) confirmedOrders: number;
  @Field(() => Int) shippedOrders: number;
  @Field(() => Float) completedRevenue: number;
  @Field(() => Float) cancelledRevenue: number;
}

@ObjectType('OrderTimeline')
export class OrderTimelineType {
  @Field(() => String) date: string;
  @Field(() => Int) ordersCount: number;
  @Field(() => Float) revenue: number;
}

@ObjectType('RecentOrder')
export class RecentOrderType {
  @Field(() => ID) orderId: string;
  @Field() orderNumber: string;
  @Field() orderDate: Date;
  @Field() customerName: string;
  @Field(() => Float) orderTotal: number;
  @Field() orderStatus: string;
  @Field({ nullable: true }) shippingCity?: string;
}

@ObjectType('TopProduct')
export class TopProductType {
  @Field(() => ID) variantId: string;
  @Field() variantSku: string;
  @Field() productName: string;
  @Field({ nullable: true }) productBrand?: string;
  @Field(() => Float) variantPrice: number;
  @Field({ nullable: true }) variantCover?: string;
  @Field({ nullable: true }) productCover?: string;
  @Field(() => Int) totalQuantitySold: number;
  @Field(() => Float) totalRevenue: number;
  @Field(() => Int) ordersCount: number;
}

@ObjectType('Dashboard')
export class DashboardType {
  @Field(() => DashboardSummaryType) summary: DashboardSummaryType;
  @Field(() => [OrderTimelineType]) ordersTimeline: OrderTimelineType[];
  @Field(() => [RecentOrderType]) recentOrders: RecentOrderType[];
  @Field(() => [TopProductType]) topProducts: TopProductType[];

  static fromDashboard(dashboard: DashboardDTO): DashboardType {
    return Object.assign(new DashboardType(), {
      ...dashboard,
      summary: Object.assign(new DashboardSummaryType(), dashboard.summary),
      ordersTimeline: dashboard.ordersTimeline.map((item) =>
        Object.assign(new OrderTimelineType(), item),
      ),
      recentOrders: dashboard.recentOrders.map((item) =>
        Object.assign(new RecentOrderType(), item),
      ),
      topProducts: dashboard.topProducts.map((item) =>
        Object.assign(new TopProductType(), item),
      ),
    });
  }
}
