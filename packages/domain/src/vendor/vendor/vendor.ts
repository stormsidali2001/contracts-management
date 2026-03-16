import { AggregateRoot } from '../../shared/aggregate-root';
import { CreatedAt } from '../../shared/value-objects/created-at';
import { Address } from './value-objects/address';
import { CompanyName } from './value-objects/company-name';
import { FiscalIdentifiers } from './value-objects/fiscal-identifiers';
import { PhoneNumbers } from './value-objects/phone-numbers';
import { VendorId } from './value-objects/vendor-id';
import { VendorNumber } from './value-objects/vendor-number';

export interface VendorProps {
  id: VendorId;
  number: VendorNumber;
  companyName: CompanyName;
  fiscalIdentifiers: FiscalIdentifiers;
  address: Address;
  phoneNumbers: PhoneNumbers;
  createdAt: CreatedAt;
}

export interface CreateVendorProps {
  id: string;
  num: string;
  name: string;
  nif: string;
  nrc: string;
  address: string;
  mobilePhone: string;
  homePhone: string;
}

export interface UpdateVendorProps {
  num?: string;
  name?: string;
  nif?: string;
  nrc?: string;
  address?: string;
  mobilePhone?: string;
  homePhone?: string;
}

export class Vendor extends AggregateRoot<VendorId> {
  private _number: VendorNumber;
  private _companyName: CompanyName;
  private _fiscalIdentifiers: FiscalIdentifiers;
  private _address: Address;
  private _phoneNumbers: PhoneNumbers;
  readonly createdAt: CreatedAt;

  private constructor(props: VendorProps) {
    super(props.id);
    this._number = props.number;
    this._companyName = props.companyName;
    this._fiscalIdentifiers = props.fiscalIdentifiers;
    this._address = props.address;
    this._phoneNumbers = props.phoneNumbers;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateVendorProps): Vendor {
    return new Vendor({
      id: new VendorId(props.id),
      number: new VendorNumber(props.num),
      companyName: new CompanyName(props.name),
      fiscalIdentifiers: new FiscalIdentifiers({ nif: props.nif, nrc: props.nrc }),
      address: new Address(props.address),
      phoneNumbers: new PhoneNumbers({
        mobilePhone: props.mobilePhone,
        homePhone: props.homePhone,
      }),
      createdAt: new CreatedAt(),
    });
  }

  static reconstitute(props: VendorProps): Vendor {
    return new Vendor(props);
  }

  get number(): VendorNumber { return this._number; }
  get companyName(): CompanyName { return this._companyName; }
  get fiscalIdentifiers(): FiscalIdentifiers { return this._fiscalIdentifiers; }
  get address(): Address { return this._address; }
  get phoneNumbers(): PhoneNumbers { return this._phoneNumbers; }

  update(props: UpdateVendorProps): void {
    if (props.num !== undefined) this._number = new VendorNumber(props.num);
    if (props.name !== undefined) this._companyName = new CompanyName(props.name);
    if (props.nif !== undefined || props.nrc !== undefined) {
      this._fiscalIdentifiers = new FiscalIdentifiers({
        nif: props.nif ?? this._fiscalIdentifiers.nif,
        nrc: props.nrc ?? this._fiscalIdentifiers.nrc,
      });
    }
    if (props.address !== undefined) this._address = new Address(props.address);
    if (props.mobilePhone !== undefined || props.homePhone !== undefined) {
      this._phoneNumbers = new PhoneNumbers({
        mobilePhone: props.mobilePhone ?? this._phoneNumbers.mobilePhone,
        homePhone: props.homePhone ?? this._phoneNumbers.homePhone,
      });
    }
  }

  canBeDeleted(agreementCount: number): boolean {
    return agreementCount === 0;
  }
}
