"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = void 0;
const aggregate_root_1 = require("../../shared/aggregate-root");
const created_at_1 = require("../../shared/value-objects/created-at");
const address_1 = require("./value-objects/address");
const company_name_1 = require("./value-objects/company-name");
const fiscal_identifiers_1 = require("./value-objects/fiscal-identifiers");
const phone_numbers_1 = require("./value-objects/phone-numbers");
const vendor_id_1 = require("./value-objects/vendor-id");
const vendor_number_1 = require("./value-objects/vendor-number");
class Vendor extends aggregate_root_1.AggregateRoot {
    constructor(props) {
        super(props.id);
        this._number = props.number;
        this._companyName = props.companyName;
        this._fiscalIdentifiers = props.fiscalIdentifiers;
        this._address = props.address;
        this._phoneNumbers = props.phoneNumbers;
        this.createdAt = props.createdAt;
    }
    static create(props) {
        return new Vendor({
            id: new vendor_id_1.VendorId(props.id),
            number: new vendor_number_1.VendorNumber(props.num),
            companyName: new company_name_1.CompanyName(props.name),
            fiscalIdentifiers: new fiscal_identifiers_1.FiscalIdentifiers({ nif: props.nif, nrc: props.nrc }),
            address: new address_1.Address(props.address),
            phoneNumbers: new phone_numbers_1.PhoneNumbers({
                mobilePhone: props.mobilePhone,
                homePhone: props.homePhone,
            }),
            createdAt: new created_at_1.CreatedAt(),
        });
    }
    static reconstitute(props) {
        return new Vendor(props);
    }
    get number() { return this._number; }
    get companyName() { return this._companyName; }
    get fiscalIdentifiers() { return this._fiscalIdentifiers; }
    get address() { return this._address; }
    get phoneNumbers() { return this._phoneNumbers; }
    update(props) {
        if (props.num !== undefined)
            this._number = new vendor_number_1.VendorNumber(props.num);
        if (props.name !== undefined)
            this._companyName = new company_name_1.CompanyName(props.name);
        if (props.nif !== undefined || props.nrc !== undefined) {
            this._fiscalIdentifiers = new fiscal_identifiers_1.FiscalIdentifiers({
                nif: props.nif ?? this._fiscalIdentifiers.nif,
                nrc: props.nrc ?? this._fiscalIdentifiers.nrc,
            });
        }
        if (props.address !== undefined)
            this._address = new address_1.Address(props.address);
        if (props.mobilePhone !== undefined || props.homePhone !== undefined) {
            this._phoneNumbers = new phone_numbers_1.PhoneNumbers({
                mobilePhone: props.mobilePhone ?? this._phoneNumbers.mobilePhone,
                homePhone: props.homePhone ?? this._phoneNumbers.homePhone,
            });
        }
    }
    canBeDeleted(agreementCount) {
        return agreementCount === 0;
    }
}
exports.Vendor = Vendor;
//# sourceMappingURL=vendor.js.map