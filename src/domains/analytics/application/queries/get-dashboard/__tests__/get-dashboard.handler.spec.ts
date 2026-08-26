import { NotFoundException } from '@nestjs/common';
import { IDashboard } from '../../../../aggregates/entities';
import { IAnalyticsRepository } from '../../../../aggregates/repositories';
import { Id } from '@shared/value-objects';
import { GetDashboardDTO } from '../get-dashboard.dto';
import { GetDashboardHandler } from '../get-dashboard.handler';

const tenantId = Id.create('018f5c89-20d9-7bb5-8a19-7e5cfb4c0ab1');

const emptyDashboard: IDashboard = {
  summary: {
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
