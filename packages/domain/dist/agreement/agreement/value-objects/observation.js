"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observation = void 0;
class Observation {
    constructor(value) {
        this.value = value?.trim() ?? null;
    }
    hasValue() {
        return this.value !== null && this.value.length > 0;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value ?? '';
    }
}
exports.Observation = Observation;
//# sourceMappingURL=observation.js.map