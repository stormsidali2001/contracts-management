"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationMembership = void 0;
class OrganizationMembership {
    constructor(props) {
        this.directionId = props.directionId ?? null;
        this.departementId = props.departementId ?? null;
    }
    static none() {
        return new OrganizationMembership({ directionId: null, departementId: null });
    }
    static of(directionId, departementId) {
        if (!directionId || !departementId) {
            throw new Error('Both directionId and departementId are required for organization membership');
        }
        return new OrganizationMembership({ directionId, departementId });
    }
    isAssigned() {
        return this.directionId !== null && this.departementId !== null;
    }
    equals(other) {
        return (this.directionId === other.directionId &&
            this.departementId === other.departementId);
    }
}
exports.OrganizationMembership = OrganizationMembership;
//# sourceMappingURL=organization-membership.js.map