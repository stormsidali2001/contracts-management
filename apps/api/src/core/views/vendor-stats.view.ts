import { VendorStatsEntity } from '../entities/VendorStats.entity';
import { stripPrivateKeys } from './strip-private-keys.util';

export class VendorStatsView {
  id: string;
  date: Date;
  nb_vendors: number;

  static from(entity: VendorStatsEntity): VendorStatsView {
    return Object.assign(new VendorStatsView(), stripPrivateKeys(entity));
  }

  static fromMany(entities: VendorStatsEntity[]): VendorStatsView[] {
    return entities.map(VendorStatsView.from);
  }
}
