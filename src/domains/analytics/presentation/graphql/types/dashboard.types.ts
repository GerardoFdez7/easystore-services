import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { MoneyType } from '@shared/presentation/graphql/';
import { DashboardDTO } from '../../../application/mappers/dashboard/dashboard.dto';

@ObjectType('DashboardSummary')
export class DashboardSummaryType {
  @Field(() => Int) totalOrders: number;
  @Field(() => MoneyType) totalRevenue: MoneyType;
  @Field(() => MoneyType) averageOrderValue: MoneyType;
  @Field(() => Int) uniqueCustomers: number;
  @Field(() => Int) completedOrders: number;
  @Field(() => Int) cancelledOrders: number;
  @Field(() => Int) processingOrders: number;
  @Field(() => Int) confirmedOrders: number;
  @Field(() => Int) shippedOrders: number;
  @Field(() => MoneyType) completedRevenue: MoneyType;
  @Field(() => MoneyType) cancelledRevenue: MoneyType;
}

@ObjectType('OrderTimeline')
export class OrderTimelineType {
  @Field(() => String) date: string;
  @Field(() => Int) ordersCount: number;
  @Field(() => MoneyType) revenue: MoneyType;
}

@ObjectType('RecentOrder')
export class RecentOrderType {
  @Field(() => ID) orderId: string;
  @Field() orderNumber: string;
  @Field() orderDate: Date;
  @Field() customerName: string;
  @Field(() => MoneyType) orderTotal: MoneyType;
  @Field() orderStatus: string;
  @Field({ nullable: true }) shippingCity?: string;
}

@ObjectType('TopProduct')
export class TopProductType {
  @Field(() => ID) variantId: string;
  @Field() variantSku: string;
  @Field() productName: string;
  @Field({ nullable: true }) productBrand?: string;
  @Field(() => MoneyType) variantPrice: MoneyType;
  @Field({ nullable: true }) variantCover?: string;
  @Field({ nullable: true }) productCover?: string;
  @Field(() => Int) totalQuantitySold: number;
  @Field(() => MoneyType) totalRevenue: MoneyType;
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
