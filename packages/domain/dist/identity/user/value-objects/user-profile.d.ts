export interface UserProfileProps {
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
}
export declare class UserProfile {
    readonly firstName: string;
    readonly lastName: string;
    readonly imageUrl: string | null;
    constructor(props: UserProfileProps);
    get fullName(): string;
    equals(other: UserProfile): boolean;
}
//# sourceMappingURL=user-profile.d.ts.map