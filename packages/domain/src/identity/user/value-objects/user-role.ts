export enum UserRoleEnum {
  EMPLOYEE = 'EMPLOYEE',
  JURIDICAL = 'JURIDICAL',
  ADMIN = 'ADMIN',
}

export class UserRole {
  readonly value: UserRoleEnum;

  constructor(value: UserRoleEnum) {
    if (!Object.values(UserRoleEnum).includes(value)) {
      throw new Error(`Invalid user role: "${value}"`);
    }
    this.value = value;
  }

  isAdmin(): boolean {
    return this.value === UserRoleEnum.ADMIN;
  }

  isJuridical(): boolean {
    return this.value === UserRoleEnum.JURIDICAL;
  }

  isEmployee(): boolean {
    return this.value === UserRoleEnum.EMPLOYEE;
  }

  /** Admins and juridical users cannot belong to a departement */
  requiresOrganizationMembership(): boolean {
    return this.value === UserRoleEnum.EMPLOYEE;
  }

  equals(other: UserRole): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
