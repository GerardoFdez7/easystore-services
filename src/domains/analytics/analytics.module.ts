import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetDashboardHandler } from './application/queries';
import { AnalyticsRepository } from './infrastructure/postgres/';
import { AnalyticsResolver } from './presentation/graphql/analytics.resolver';

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IAnalyticsRepository', useClass: AnalyticsRepository },
    GetDashboardHandler,
    AnalyticsResolver,
  ],
})
export class AnalyticsDomain {}
