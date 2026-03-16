import { useQuery } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';
import { statisticsKeys } from '@/lib/query-keys';
import { AgreementStatus } from '@/features/statistics/models/AgreementStats.interface';
import { AgreementTypes } from '@/features/statistics/models/AgreementTypes.interface';
import { TopDirections } from '@/features/statistics/models/AgreementsTopDirections.interface';
import { UserTypes } from '@/features/statistics/models/UserTypes.interface';
import { VendorStats } from '@/features/statistics/models/VendorStats.interface';

export interface Statistics {
  agreementsStats: {
    status: AgreementStatus;
    topDirections: TopDirections;
    types: AgreementTypes;
  };
  userTypes: UserTypes;
  vendorsStats: VendorStats;
}

export interface StatisticsParams {
  startDate?: string;
  endDate?: string;
}

export const useStatistics = (params: StatisticsParams = {}) => {
  const axios = useAxiosPrivate({});
  const { startDate, endDate } = params;
  return useQuery({
    queryKey: statisticsKeys.detail(startDate, endDate),
    queryFn: () =>
      axios
        .get<Statistics>('/statistics', {
          params: {
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          },
        })
        .then((r) => r.data),
  });
};
