import { DashboardDataType } from '../../presentation/graphql/types/total-sales.type';

export default interface IDashboardRepository {
  getDashboardData(tenantId: string): Promise<DashboardDataType>;
}
