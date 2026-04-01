export interface PermissionsView {
    agreements: {
        canCreate: boolean;
        canExecute: boolean;
    };
    vendors: {
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    };
    directions: {
        canCreate: boolean;
        canDelete: boolean;
        canManageDepartements: boolean;
    };
    users: {
        canCreate: boolean;
        canDelete: boolean;
        canEditAny: boolean;
    };
    filters: {
        canFilterByDirection: boolean;
    };
}
//# sourceMappingURL=permissions.view.d.ts.map