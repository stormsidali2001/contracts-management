export enum OperationTypeEnum {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}

export class OperationType {
  readonly value: OperationTypeEnum;

  constructor(value: OperationTypeEnum) {
    if (!Object.values(OperationTypeEnum).includes(value)) {
      throw new Error(`Invalid operation type: "${value}"`);
    }
    this.value = value;
  }

  equals(other: OperationType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
