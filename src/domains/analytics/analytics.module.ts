import { Module } from '@nestjs/common';
import { GetDashboardHandler } from './application/queries';
import { AnalyticsRepository } from './infrastructure/persistence/postgres/analytics.repository';
import { AnalyticsResolver } from './presentation/graphql/analytics.resolver';

@Module({
  providers: [
    { provide: 'IAnalyticsRepository', useClass: AnalyticsRepository },
    GetDashboardHandler,
    AnalyticsResolver,
  ],
})
export class AnalyticsDomain {}
