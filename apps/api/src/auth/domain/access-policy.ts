import { UserRole } from 'src/core/types/UserRole.enum';
import { PermissionsView } from '@contracts/types';

export class AccessPolicy {
  static for(role: UserRole): PermissionsView {
    const isJuridical = role === UserRole.JURIDICAL;
    const isAdmin = role === UserRole.ADMIN;

    return {
      agreements: {
        canCreate: isJuridical,
        canExecute: isJuridical,
      },
      vendors: {
        canCreate: isJuridical,
        canEdit: isJuridical,
        canDelete: isJuridical,
      },
      directions: {
        canCreate: isAdmin,
        canDelete: isAdmin,
        canManageDepartements: isAdmin,
      },
      users: {
        canCreate: isAdmin,
        canDelete: isAdmin,
        canEditAny: isAdmin,
      },
      filters: {
        canFilterByDirection: isAdmin || isJuridical,
      },
    };
  }
}
