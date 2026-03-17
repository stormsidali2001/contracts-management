import { UserRole } from 'src/core/types/UserRole.enum';

export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly role: UserRole,
    public readonly email: string,
    public readonly departementId: string | null,
    public readonly directionId: string | null,
    public readonly departementAbriviation: string,
    public readonly directionAbriviation: string,
  ) {}
}
