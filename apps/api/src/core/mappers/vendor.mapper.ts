import { VendorView } from '@contracts/types';
import { Vendor } from 'src/Agreement/domain/vendor.aggregate';
import { VendorWithCounts } from 'src/Agreement/domain/vendor.repository';

export class VendorMapper {
  static from(source: Vendor | VendorWithCounts): VendorView {
    const withCounts = source as VendorWithCounts;
    return {
      id: source.id,
      num: source.num,
      company_name: source.company_name,
      nif: source.nif,
      nrc: source.nrc,
      address: source.address,
      mobile_phone_number: source.mobile_phone_number,
      home_phone_number: source.home_phone_number,
      createdAt: source.createdAt,
      contractCount: withCounts.contractCount,
      convensionCount: withCounts.convensionCount,
    };
  }

  static fromMany(sources: (Vendor | VendorWithCounts)[]): VendorView[] {
    return sources.map(VendorMapper.from);
  }
}
