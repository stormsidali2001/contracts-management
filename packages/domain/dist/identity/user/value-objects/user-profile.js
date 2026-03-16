"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
class UserProfile {
    constructor(props) {
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
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    equals(other) {
        return (this.firstName === other.firstName &&
            this.lastName === other.lastName &&
            this.imageUrl === other.imageUrl);
    }
}
exports.UserProfile = UserProfile;
//# sourceMappingURL=user-profile.js.map