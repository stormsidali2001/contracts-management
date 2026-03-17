import { VendorEntity } from '../entities/Vendor.entity';
import { stripPrivateKeys } from './strip-private-keys.util';

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
  agreementCount?: number;

  static from(entity: VendorEntity): VendorView {
    return Object.assign(new VendorView(), stripPrivateKeys(entity));
  }

  static fromMany(entities: VendorEntity[]): VendorView[] {
    return entities.map(VendorView.from);
  }
}
