export class Vendor {
  readonly id: string;
  num: string;
  company_name: string;
  nif: string;
  nrc: string;
  address: string;
  mobile_phone_number: string;
  home_phone_number: string;
  createdAt: Date;

  private constructor(props: {
    id: string;
    num: string;
    company_name: string;
    nif: string;
    nrc: string;
    address: string;
    mobile_phone_number: string;
    home_phone_number: string;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.num = props.num;
    this.company_name = props.company_name;
    this.nif = props.nif;
    this.nrc = props.nrc;
    this.address = props.address;
    this.mobile_phone_number = props.mobile_phone_number;
    this.home_phone_number = props.home_phone_number;
    this.createdAt = props.createdAt;
  }

  static create(props: {
    id: string;
    num: string;
    company_name: string;
    nif: string;
    nrc: string;
    address: string;
    mobile_phone_number: string;
    home_phone_number: string;
    createdAt: Date;
  }): Vendor {
    return new Vendor(props);
  }

  update(partial: {
    num?: string;
    company_name?: string;
    nif?: string;
    nrc?: string;
    address?: string;
    mobile_phone_number?: string;
    home_phone_number?: string;
  }): void {
    Object.assign(this, partial);
  }

  canBeDeleted(agreementCount: number): boolean {
    return agreementCount === 0;
  }
}
