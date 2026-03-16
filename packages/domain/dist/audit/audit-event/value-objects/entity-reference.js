"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityReference = void 0;
const entity_type_1 = require("./entity-type");
class EntityReference {
    constructor(props) {
        if (!props.entityId || props.entityId.trim().length === 0) {
            throw new Error('Entity reference ID must not be empty');
        }
        this.entityId = props.entityId.trim();
        this.entityType = new entity_type_1.EntityType(props.entityType);
    }
    equals(other) {
        return (this.entityId === other.entityId &&
            this.entityType.equals(other.entityType));
    }
}
exports.EntityReference = EntityReference;
//# sourceMappingURL=entity-reference.js.map