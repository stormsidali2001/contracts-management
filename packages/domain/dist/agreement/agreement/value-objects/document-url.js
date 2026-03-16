"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUrl = void 0;
class DocumentUrl {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Document URL must not be empty');
        }
        this.value = value.trim();
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.DocumentUrl = DocumentUrl;
//# sourceMappingURL=document-url.js.map