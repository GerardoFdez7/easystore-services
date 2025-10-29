import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

// General View of Dashboard Data
@ObjectType('DashboardSummary')
export class DashboardSummaryType {
  @Field(() => Int)
  total_orders: number;

  @Field(() => Float)
  total_revenue: number;

  @Field(() => Float)
  average_order_value: number;

  @Field(() => Int)
  unique_customers: number;

  @Field(() => Int)
  completed_orders: number;

  @Field(() => Int)
  cancelled_orders: number;

  @Field(() => Int)
  processing_orders: number;

  @Field(() => Int)
  confirmed_orders: number;

  @Field(() => Int)
  shipped_orders: number;

  @Field(() => Float)
  completed_revenue: number;

  @Field(() => Float)
  cancelled_revenue: number;
}

// Timeline of Orders
@ObjectType('OrderTimeline')
export class OrderTimelineType {
  @Field(() => String)
  date: string;

  @Field(() => Int)
  orders_count: number;

  @Field(() => Float)
  revenue: number;
}

// Recent Order
@ObjectType('RecentOrder')
export class RecentOrderType {
  @Field(() => ID)
  order_id: string;

  @Field()
  order_number: string;

  @Field()
  order_date: Date;

  @Field()
  customer_name: string;

  @Field(() => Float)
  order_total: number;

  @Field()
  order_status: string;

  @Field({ nullable: true })
  shipping_city?: string;
}

// Top Product
@ObjectType('TopProduct')
export class TopProductType {
  @Field(() => ID)
  variant_id: string;

  @Field()
  variant_sku: string;

  @Field()
  product_name: string;

  @Field({ nullable: true })
  product_brand?: string;

  @Field(() => Float)
  variant_price: number;

  @Field({ nullable: true })
  variant_cover?: string;

  @Field({ nullable: true })
  product_cover?: string;

  @Field(() => Int)
  total_quantity_sold: number;

  @Field(() => Float)
  total_revenue: number;

  @Field(() => Int)
  orders_count: number;
}

// ============================================
// PRINCIPAL VIEW OF DASHBOARD DATA
// ============================================
@ObjectType('DashboardData')
export class DashboardDataType {
  @Field(() => DashboardSummaryType)
  summary: DashboardSummaryType;

  @Field(() => [OrderTimelineType])
  ordersTimeline: OrderTimelineType[];

  @Field(() => [RecentOrderType])
  recentOrders: RecentOrderType[];

  @Field(() => [TopProductType])
  topProducts: TopProductType[];
}
