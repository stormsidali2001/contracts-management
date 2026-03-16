export interface UserProfileProps {
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
}

export class UserProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly imageUrl: string | null;

  constructor(props: UserProfileProps) {
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name must not be empty');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name must not be empty');
    }
    this.firstName = props.firstName.trim();
    this.lastName = props.lastName.trim();
    this.imageUrl = props.imageUrl?.trim() ?? null;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  equals(other: UserProfile): boolean {
    return (
      this.firstName === other.firstName &&
      this.lastName === other.lastName &&
      this.imageUrl === other.imageUrl
    );
  }
}
