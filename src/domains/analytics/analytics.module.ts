import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetDashboardHandler } from './application/queries';
import { AnalyticsRepository } from './infrastructure/persistence/postgres/analytics.repository';
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
