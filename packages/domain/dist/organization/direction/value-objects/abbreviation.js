"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Abbreviation = void 0;
class Abbreviation {
    constructor(value) {
        const trimmed = value?.trim() ?? '';
        if (trimmed.length < 2 || trimmed.length > 10) {
            throw new Error('Abbreviation must be between 2 and 10 characters');
        }
        this.value = trimmed.toUpperCase();
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.Abbreviation = Abbreviation;
//# sourceMappingURL=abbreviation.js.map