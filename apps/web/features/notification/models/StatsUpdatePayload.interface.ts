import { UserTypes } from '@/features/statistics/models/UserTypes.interface';
import { VendorStats } from '@/features/statistics/models/VendorStats.interface';

export interface StatsUpdatePayload {
  vendorsStats?: VendorStats;
  userTypes?: UserTypes;
}
