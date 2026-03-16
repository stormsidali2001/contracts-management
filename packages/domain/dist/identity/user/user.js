"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const aggregate_root_1 = require("../../shared/aggregate-root");
const created_at_1 = require("../../shared/value-objects/created-at");
const password_reset_token_1 = require("./entities/password-reset-token");
const email_address_1 = require("./value-objects/email-address");
const notification_preference_1 = require("./value-objects/notification-preference");
const organization_membership_1 = require("./value-objects/organization-membership");
const password_hash_1 = require("./value-objects/password-hash");
const refresh_token_hash_1 = require("./value-objects/refresh-token-hash");
const user_profile_1 = require("./value-objects/user-profile");
const user_id_1 = require("./value-objects/user-id");
const user_role_1 = require("./value-objects/user-role");
const username_1 = require("./value-objects/username");
class User extends aggregate_root_1.AggregateRoot {
    constructor(props) {
        super(props.id);
        this._email = props.email;
        this._username = props.username;
        this._password = props.password;
        this._role = props.role;
        this._profile = props.profile;
        this._recieve_notifications = props.recieve_notifications;
        this._membership = props.membership;
        this._active = props.active;
        this._refresh_token_hash = props.refresh_token_hash;
        this._password_token = props.password_token;
        this.created_at = props.created_at;
    }
    static create(props) {
        const role = new user_role_1.UserRole(props.role);
        const membership = role.requiresOrganizationMembership() &&
            props.directionId &&
            props.departementId
            ? organization_membership_1.OrganizationMembership.of(props.directionId, props.departementId)
            : organization_membership_1.OrganizationMembership.none();
        return new User({
            id: new user_id_1.UserId(props.id),
            email: new email_address_1.EmailAddress(props.email),
            username: new username_1.Username(props.username),
            password: new password_hash_1.PasswordHash(props.password),
            role,
            profile: new user_profile_1.UserProfile({
                firstName: props.firstName,
                lastName: props.lastName,
                imageUrl: props.imageUrl,
            }),
            recieve_notifications: new notification_preference_1.NotificationPreference(false),
            membership,
            active: true,
            refresh_token_hash: refresh_token_hash_1.RefreshTokenHash.empty(),
            password_token: null,
            created_at: new created_at_1.CreatedAt(),
        });
    }
    static reconstitute(props) {
        return new User(props);
    }
    get email() { return this._email; }
    get username() { return this._username; }
    get password() { return this._password; }
    get role() { return this._role; }
    get profile() { return this._profile; }
    get recieve_notifications() { return this._recieve_notifications; }
    get membership() { return this._membership; }
    get active() { return this._active; }
    get refresh_token_hash() { return this._refresh_token_hash; }
    get password_token() { return this._password_token; }
    changeRole(role) {
        this._role = new user_role_1.UserRole(role);
        if (!this._role.requiresOrganizationMembership()) {
            this._membership = organization_membership_1.OrganizationMembership.none();
        }
    }
    assignToOrganization(directionId, departementId) {
        if (!this._role.requiresOrganizationMembership()) {
            throw new Error(`Role "${this._role.value}" cannot be assigned to an organization`);
        }
        this._membership = organization_membership_1.OrganizationMembership.of(directionId, departementId);
    }
    toggleNotifications() {
        this._recieve_notifications = this._recieve_notifications.toggle();
    }
    activate() { this._active = true; }
    deactivate() { this._active = false; }
    setRefreshToken(hash) {
        this._refresh_token_hash = new refresh_token_hash_1.RefreshTokenHash(hash);
    }
    clearRefreshToken() {
        this._refresh_token_hash = refresh_token_hash_1.RefreshTokenHash.empty();
    }
    requestPasswordReset(tokenValue) {
        const token = password_reset_token_1.PasswordResetToken.create(tokenValue);
        this._password_token = token;
        return token;
    }
    resetPassword(newHash) {
        this._password = new password_hash_1.PasswordHash(newHash);
        this._password_token = null;
    }
    canAccessDepartement(departementId) {
        return this._membership.departementId === departementId;
    }
    isInOrganization(directionId, departementId) {
        return (this._membership.directionId === directionId &&
            this._membership.departementId === departementId);
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map