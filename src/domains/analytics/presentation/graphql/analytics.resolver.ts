import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { Id } from '@shared/value-objects';
import {
  GetDashboardDTO,
  GetDashboardHandler,
} from '../../application/queries';
import { DashboardType } from './types';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly getDashboardHandler: GetDashboardHandler) {}

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => DashboardType, {
    description:
      'Get all dashboard  in a single query: summary, timeline, recent orders, and top products',
  })
  async getDashboard(@CurrentUser() user: JwtPayload): Promise<DashboardType> {
    const dashboard = await this.getDashboardHandler.execute(
      new GetDashboardDTO(Id.create(user.tenantId)),
    );

    return DashboardType.fromDashboard(dashboard);
  }
}
