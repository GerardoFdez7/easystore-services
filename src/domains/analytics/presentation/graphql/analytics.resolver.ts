import { Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import {
  CurrentUser,
  JwtPayload,
  RequirePermission,
} from '@shared/presentation/decorators';
import {
  Id,
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
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

  @RequirePermission(FeatureEnum.ANALYTICS, PermissionActionEnum.VIEW)
  @Query(() => DashboardType, {
    description:
      'Get all dashboard  in a single query: summary, timeline, recent orders, and top products.',
  })
  async getDashboard(@CurrentUser() user: JwtPayload): Promise<DashboardType> {
    if (user.customerId) {
      throw new ForbiddenException(
        'Access denied: You cannot access this information.',
      );
    }

    const dashboard = await this.getDashboardHandler.execute(
      new GetDashboardDTO(Id.create(user.tenantId)),
    );

    return DashboardType.fromDashboard(dashboard);
  }
}
