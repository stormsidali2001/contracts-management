import { EntityType, EntityTypeEnum } from './entity-type';

export interface EntityReferenceProps {
  entityId: string;
  entityType: EntityTypeEnum;
}

export class EntityReference {
  readonly entityId: string;
  readonly entityType: EntityType;

  constructor(props: EntityReferenceProps) {
    if (!props.entityId || props.entityId.trim().length === 0) {
      throw new Error('Entity reference ID must not be empty');
    }
    this.entityId = props.entityId.trim();
    this.entityType = new EntityType(props.entityType);
  }

  equals(other: EntityReference): boolean {
    return (
      this.entityId === other.entityId &&
      this.entityType.equals(other.entityType)
    );
  }
}
