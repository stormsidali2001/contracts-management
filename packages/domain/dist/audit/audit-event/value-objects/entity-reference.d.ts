import { EntityType, EntityTypeEnum } from './entity-type';
export interface EntityReferenceProps {
    entityId: string;
    entityType: EntityTypeEnum;
}
export declare class EntityReference {
    readonly entityId: string;
    readonly entityType: EntityType;
    constructor(props: EntityReferenceProps);
    equals(other: EntityReference): boolean;
}
//# sourceMappingURL=entity-reference.d.ts.map