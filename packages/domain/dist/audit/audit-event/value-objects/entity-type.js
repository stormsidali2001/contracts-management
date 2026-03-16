"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityType = exports.EntityTypeEnum = void 0;
var EntityTypeEnum;
(function (EntityTypeEnum) {
    EntityTypeEnum["CONTRACT"] = "CONTRACT";
    EntityTypeEnum["CONVENSION"] = "CONVENSION";
    EntityTypeEnum["EMPLOYEE"] = "EMPLOYEE";
    EntityTypeEnum["JURIDICAL"] = "JURIDICAL";
    EntityTypeEnum["ADMIN"] = "ADMIN";
    EntityTypeEnum["VENDOR"] = "VENDOR";
})(EntityTypeEnum || (exports.EntityTypeEnum = EntityTypeEnum = {}));
class EntityType {
    constructor(value) {
        if (!Object.values(EntityTypeEnum).includes(value)) {
            throw new Error(`Invalid entity type: "${value}"`);
        }
        this.value = value;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.EntityType = EntityType;
//# sourceMappingURL=entity-type.js.map