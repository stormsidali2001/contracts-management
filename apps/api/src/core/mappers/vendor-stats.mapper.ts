import { VendorStatsView } from '@contracts/types';
import { VendorStat } from 'src/Agreement/domain/vendor-stat';

export class VendorStatsMapper {
  static from(stat: VendorStat): VendorStatsView {
    return {
      id: stat.id,
      date: stat.date,
      nb_vendors: stat.nb_vendors,
    };
  }

  static fromMany(stats: VendorStat[]): VendorStatsView[] {
    return stats.map(VendorStatsMapper.from);
  }
}
