import { VendorEntity } from 'src/core/entities/Vendor.entity';
import {
  Vendor,
  VendorId,
  VendorNumber,
  CompanyName,
  FiscalIdentifiers,
  Address,
  PhoneNumbers,
  CreatedAt,
} from '@contracts/domain';

export class VendorMapper {
  static toDomain(entity: VendorEntity): Vendor {
    return Vendor.reconstitute({
      id: new VendorId(entity.id),
      number: new VendorNumber(entity.num),
      companyName: new CompanyName(entity.company_name),
      fiscalIdentifiers: new FiscalIdentifiers({ nif: entity.nif, nrc: entity.nrc }),
      address: new Address(entity.address),
      phoneNumbers: new PhoneNumbers({
        mobilePhone: entity.mobile_phone_number,
        homePhone: entity.home_phone_number,
      }),
      createdAt: new CreatedAt(entity.createdAt),
    });
  }

  static toPersistence(domain: Vendor): Partial<VendorEntity> {
    return {
      id: domain.getId().value,
      num: domain.number.value,
      company_name: domain.companyName.value,
      nif: domain.fiscalIdentifiers.nif,
      nrc: domain.fiscalIdentifiers.nrc,
      address: domain.address.value,
      mobile_phone_number: domain.phoneNumbers.mobilePhone,
      home_phone_number: domain.phoneNumbers.homePhone,
      createdAt: domain.createdAt.value,
    };
  }
}
