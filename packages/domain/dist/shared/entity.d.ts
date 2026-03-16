export declare abstract class Entity<TId> {
    private readonly _id;
    protected constructor(_id: TId);
    getId(): TId;
    equals(other: Entity<TId>): boolean;
}
//# sourceMappingURL=entity.d.ts.map