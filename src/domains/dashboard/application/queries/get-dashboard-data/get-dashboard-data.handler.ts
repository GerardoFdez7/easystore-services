import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetDashboardDataDTO } from './get-dashboard-data.dto';
import { DashboardDataType } from '../../../presentation/graphql/types/total-sales.type';
import IDashboardRepository from '../../../aggregates/repositories/dashboard.interface';

@QueryHandler(GetDashboardDataDTO)
export class GetDashboardDataHandler
  implements IQueryHandler<GetDashboardDataDTO>
{
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(query: GetDashboardDataDTO): Promise<DashboardDataType> {
    const { tenantId } = query;
    return await this.dashboardRepository.getDashboardData(tenantId);
  }
}
