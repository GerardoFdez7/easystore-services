import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { IDashboard } from '../../../../aggregates/entities';
import { IAnalyticsRepository } from '../../../../aggregates/repositories';
import { DashboardMapper } from '../../../../application/mappers';
import { DecimalScalar } from '@shared/presentation/graphql/';
import { CurrencyCodes, Id } from '@shared/aggregates/value-objects';
import { GetDashboardDTO } from '../get-dashboard.dto';
import { GetDashboardHandler } from '../get-dashboard.handler';

const tenantId = Id.create('018f5c89-20d9-7bb5-8a19-7e5cfb4c0ab1');

const emptyDashboard: IDashboard = {
  summary: {
    totalOrders: 0,
    totalRevenue: { amount: '0', currency: CurrencyCodes.USD },
    averageOrderValue: { amount: '0', currency: CurrencyCodes.USD },
    uniqueCustomers: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    processingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    completedRevenue: { amount: '0', currency: CurrencyCodes.USD },
    cancelledRevenue: { amount: '0', currency: CurrencyCodes.USD },
  },
  ordersTimeline: [],
  recentOrders: [],
  topProducts: [],
};

describe('GetDashboardHandler', () => {
  let repository: jest.Mocked<IAnalyticsRepository>;
  let handler: GetDashboardHandler;

  beforeEach(() => {
    repository = { getDashboard: jest.fn() };
    handler = new GetDashboardHandler(repository);
  });

  it('returns valid zero and empty dashboard values', async () => {
    repository.getDashboard.mockResolvedValue(emptyDashboard);

    await expect(
      handler.execute(new GetDashboardDTO(tenantId)),
    ).resolves.toEqual(emptyDashboard);
  });

  it('throws only when the repository has no result', async () => {
    repository.getDashboard.mockResolvedValue(undefined);

    await expect(
      handler.execute(new GetDashboardDTO(tenantId)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('passes the exact tenant Id instance to the repository', async () => {
    repository.getDashboard.mockResolvedValue(emptyDashboard);

    await handler.execute(new GetDashboardDTO(tenantId));

    expect(repository.getDashboard).toHaveBeenCalledWith(tenantId);
  });
});

describe('DashboardMapper monetary values', () => {
  it('keeps fractional and large decimal aggregate totals and averages exact', () => {
    const summary = DashboardMapper.dashboardSummary(
      {
        totalOrders: 3,
        totalRevenue: new Decimal('9007199254740993.123456789012345678'),
        averageOrderValue: new Decimal('3002399751580331.041152263004115226'),
        uniqueCustomers: 2,
        completedOrders: 2,
        cancelledOrders: 1,
        processingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        completedRevenue: new Decimal('9007199254740992.999999999999999999'),
        cancelledRevenue: new Decimal('0.123456789012345679'),
      },
      'USD',
    );

    expect(summary).toMatchObject({
      totalRevenue: {
        amount: '9007199254740993.123456789012345678',
        currency: 'USD',
      },
      averageOrderValue: {
        amount: '3002399751580331.041152263004115226',
        currency: 'USD',
      },
      completedRevenue: {
        amount: '9007199254740992.999999999999999999',
        currency: 'USD',
      },
      cancelledRevenue: { amount: '0.123456789012345679', currency: 'USD' },
    });
  });

  it('keeps exact values through timeline, recent-order, and product responses', () => {
    expect(
      DashboardMapper.orderTimeline(
        {
          date: '2026-08-31',
          ordersCount: 2,
          revenue: new Decimal('10000000000000000.000000000000000001'),
        },
        'USD',
      ).revenue,
    ).toEqual({
      amount: '10000000000000000.000000000000000001',
      currency: 'USD',
    });

    expect(
      DashboardMapper.recentOrder(
        {
          orderId: 'order-id',
          orderNumber: 'ORD-001',
          orderDate: new Date('2026-08-31T00:00:00.000Z'),
          customerName: 'Customer',
          orderTotal: new Decimal('0.000000000000000001'),
          orderStatus: 'COMPLETED',
        },
        'USD',
      ).orderTotal,
    ).toEqual({ amount: '0.000000000000000001', currency: 'USD' });

    expect(
      DashboardMapper.topProduct(
        {
          variantId: 'variant-id',
          variantSku: 'SKU-001',
          productName: 'Product',
          variantPrice: new Decimal('9999999999999999.999999999999999999'),
          totalQuantitySold: 2,
          totalRevenue: new Decimal('19999999999999999.999999999999999998'),
          ordersCount: 2,
        },
        'USD',
      ),
    ).toMatchObject({
      variantPrice: {
        amount: '9999999999999999.999999999999999999',
        currency: 'USD',
      },
      totalRevenue: {
        amount: '19999999999999999.999999999999999998',
        currency: 'USD',
      },
    });
  });
});

describe('DecimalScalar', () => {
  it('serializes canonical decimal strings without losing precision', () => {
    const scalar = new DecimalScalar();

    expect(scalar.serialize('9007199254740993.123456789012345678')).toBe(
      '9007199254740993.123456789012345678',
    );
    expect(scalar.parseValue('0001.2300')).toBe('1.23');
  });
});
