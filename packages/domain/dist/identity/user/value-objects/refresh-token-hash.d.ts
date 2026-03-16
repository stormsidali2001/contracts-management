export declare class RefreshTokenHash {
    readonly value: string | null;
    constructor(value: string | null);
    static empty(): RefreshTokenHash;
    isPresent(): boolean;
    equals(other: RefreshTokenHash): boolean;
    toJSON(): string;
}
//# sourceMappingURL=refresh-token-hash.d.ts.map