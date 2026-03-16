"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationTitle = void 0;
class OrganizationTitle {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Organization title must not be empty');
        }
        this.value = value.trim();
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.OrganizationTitle = OrganizationTitle;
//# sourceMappingURL=organization-title.js.map