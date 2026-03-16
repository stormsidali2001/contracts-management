export interface PhoneNumbersProps {
  mobilePhone: string;
  homePhone: string;
}

export class PhoneNumbers {
  readonly mobilePhone: string;
  readonly homePhone: string;

  constructor(props: PhoneNumbersProps) {
    this.mobilePhone = props.mobilePhone?.trim() ?? '';
    this.homePhone = props.homePhone?.trim() ?? '';
  }

  equals(other: PhoneNumbers): boolean {
    return this.mobilePhone === other.mobilePhone && this.homePhone === other.homePhone;
  }
}
