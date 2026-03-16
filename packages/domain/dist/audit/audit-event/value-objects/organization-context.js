"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationContext = void 0;
class OrganizationContext {
    constructor(props = {}) {
        this.departementAbriviation = props.departementAbriviation?.trim() ?? null;
        this.directionAbriviation = props.directionAbriviation?.trim() ?? null;
    }
    static empty() {
        return new OrganizationContext({});
    }
    hasContext() {
        return this.departementAbriviation !== null || this.directionAbriviation !== null;
    }
    equals(other) {
        return (this.departementAbriviation === other.departementAbriviation &&
            this.directionAbriviation === other.directionAbriviation);
    }
}
exports.OrganizationContext = OrganizationContext;
//# sourceMappingURL=organization-context.js.map