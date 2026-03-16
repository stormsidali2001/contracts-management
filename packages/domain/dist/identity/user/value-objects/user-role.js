"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.UserRoleEnum = void 0;
var UserRoleEnum;
(function (UserRoleEnum) {
    UserRoleEnum["EMPLOYEE"] = "EMPLOYEE";
    UserRoleEnum["JURIDICAL"] = "JURIDICAL";
    UserRoleEnum["ADMIN"] = "ADMIN";
})(UserRoleEnum || (exports.UserRoleEnum = UserRoleEnum = {}));
class UserRole {
    constructor(value) {
        if (!Object.values(UserRoleEnum).includes(value)) {
            throw new Error(`Invalid user role: "${value}"`);
        }
        this.value = value;
    }
    isAdmin() {
        return this.value === UserRoleEnum.ADMIN;
    }
    isJuridical() {
        return this.value === UserRoleEnum.JURIDICAL;
    }
    isEmployee() {
        return this.value === UserRoleEnum.EMPLOYEE;
    }
    /** Admins and juridical users cannot belong to a departement */
    requiresOrganizationMembership() {
        return this.value === UserRoleEnum.EMPLOYEE;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.UserRole = UserRole;
//# sourceMappingURL=user-role.js.map