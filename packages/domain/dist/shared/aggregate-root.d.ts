export declare abstract class AggregateRoot<TId> {
    private readonly _id;
    private readonly _domainEvents;
    protected constructor(_id: TId);
    getId(): TId;
    equals(other: AggregateRoot<TId>): boolean;
    protected addDomainEvent(event: unknown): void;
    pullDomainEvents(): unknown[];
}
//# sourceMappingURL=aggregate-root.d.ts.map