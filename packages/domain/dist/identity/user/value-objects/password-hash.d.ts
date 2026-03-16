export declare class PasswordHash {
    readonly value: string;
    constructor(value: string);
    equals(other: PasswordHash): boolean;
    /** Never expose the raw hash in serialization */
    toJSON(): string;
}
//# sourceMappingURL=password-hash.d.ts.map