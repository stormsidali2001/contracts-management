import { Vendor } from 'src/Agreement/domain/vendor';
import { VendorWithCounts } from 'src/Agreement/domain/vendor.repository';
import { stripPrivateKeys } from './strip-private-keys.util';

type VendorLike = Vendor | VendorWithCounts;

export class VendorView {
  id: string;
  num: string;
  company_name: string;
  nif: string;
  nrc: string;
  address: string;
  mobile_phone_number: string;
  home_phone_number: string;
  createdAt: Date;
  agreements?: any[];
  contractCount?: number;
  convensionCount?: number;

  static from(source: VendorLike): VendorView {
    return Object.assign(new VendorView(), stripPrivateKeys(source));
  }

  static fromMany(sources: VendorLike[]): VendorView[] {
    return sources.map(VendorView.from);
  }
}
