import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DashboardRepository } from './infrastructure/persistence/postgres/dashboard.repository';
import { DashboardResolver } from './presentation/graphql/dashboard.resolver';
import { GetDashboardDataHandler } from './application/queries';

const QueryHandlers = [GetDashboardDataHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IDashboardRepository', useClass: DashboardRepository },
    DashboardResolver,
    ...QueryHandlers,
  ],
})
export class DashboardModule {}
