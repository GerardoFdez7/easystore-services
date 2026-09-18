import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IAnalyticsRepository } from '../../../aggregates/repositories';
import { DashboardDTO, DashboardMapper } from '../../mappers';
import { GetDashboardDTO } from './get-dashboard.dto';

@QueryHandler(GetDashboardDTO)
export class GetDashboardHandler implements IQueryHandler<GetDashboardDTO> {
  constructor(
    @Inject('IAnalyticsRepository')
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(query: GetDashboardDTO): Promise<DashboardDTO> {
    const result = await this.analyticsRepository.getDashboard(query.storeId);

    if (!result) {
      throw new NotFoundException(
        `No dashboard found for Store with ID: ${query.storeId.getValue()}`,
      );
    }

    return DashboardMapper.toDto(result);
  }
}
