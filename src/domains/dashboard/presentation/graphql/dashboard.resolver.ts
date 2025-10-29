import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import AuthGuard from 'src/domains/authentication/infrastructure/guard/auth.guard';
import { DashboardDataType } from './types/total-sales.type';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { GetDashboardDataDTO } from '../../application/queries';

@Resolver()
@UseGuards(AuthGuard)
export class DashboardResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => DashboardDataType, {
    description:
      'Get all dashboard data in a single query: summary, timeline, recent orders, and top products',
  })
  async getDashboardData(
    @CurrentUser() user: JwtPayload,
  ): Promise<DashboardDataType> {
    return await this.queryBus.execute(new GetDashboardDataDTO(user.tenantId));
  }
}
