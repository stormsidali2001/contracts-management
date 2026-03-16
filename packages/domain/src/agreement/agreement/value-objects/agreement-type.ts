export enum AgreementTypeEnum {
  CONTRACT = 'contract',
  CONVENSION = 'convension',
}

export class AgreementType {
  readonly value: AgreementTypeEnum;

  constructor(value: AgreementTypeEnum) {
    if (!Object.values(AgreementTypeEnum).includes(value)) {
      throw new Error(`Invalid agreement type: "${value}"`);
    }
    this.value = value;
  }

  isContract(): boolean {
    return this.value === AgreementTypeEnum.CONTRACT;
  }

  isConvension(): boolean {
    return this.value === AgreementTypeEnum.CONVENSION;
  }

  equals(other: AgreementType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
