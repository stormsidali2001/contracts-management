import { VendorStatsView } from '@contracts/types';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';

export class VendorStatsMapper {
  static from(entity: VendorStatsEntity): VendorStatsView {
    return {
      id: entity.id,
      date: entity.date,
      nb_vendors: entity.nb_vendors,
    };
  }

  static fromMany(entities: VendorStatsEntity[]): VendorStatsView[] {
    return entities.map(VendorStatsMapper.from);
  }
}
