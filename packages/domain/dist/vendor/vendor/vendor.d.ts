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
export declare class Vendor extends AggregateRoot<VendorId> {
    private _number;
    private _companyName;
    private _fiscalIdentifiers;
    private _address;
    private _phoneNumbers;
    readonly createdAt: CreatedAt;
    private constructor();
    static create(props: CreateVendorProps): Vendor;
    static reconstitute(props: VendorProps): Vendor;
    get number(): VendorNumber;
    get companyName(): CompanyName;
    get fiscalIdentifiers(): FiscalIdentifiers;
    get address(): Address;
    get phoneNumbers(): PhoneNumbers;
    update(props: UpdateVendorProps): void;
    canBeDeleted(agreementCount: number): boolean;
}
//# sourceMappingURL=vendor.d.ts.map