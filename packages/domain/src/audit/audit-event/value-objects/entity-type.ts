export enum EntityTypeEnum {
  CONTRACT = 'CONTRACT',
  CONVENSION = 'CONVENSION',
  EMPLOYEE = 'EMPLOYEE',
  JURIDICAL = 'JURIDICAL',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
}

export class EntityType {
  readonly value: EntityTypeEnum;

  constructor(value: EntityTypeEnum) {
    if (!Object.values(EntityTypeEnum).includes(value)) {
      throw new Error(`Invalid entity type: "${value}"`);
    }
    this.value = value;
  }

  equals(other: EntityType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
