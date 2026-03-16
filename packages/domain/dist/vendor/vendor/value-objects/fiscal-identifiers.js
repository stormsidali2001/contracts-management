"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiscalIdentifiers = void 0;
class FiscalIdentifiers {
    constructor(props) {
        if (!props.nif || props.nif.trim().length === 0) {
            throw new Error('NIF must not be empty');
        }
        if (!props.nrc || props.nrc.trim().length === 0) {
            throw new Error('NRC must not be empty');
        }
        this.nif = props.nif.trim();
        this.nrc = props.nrc.trim();
    }
    equals(other) {
        return this.nif === other.nif && this.nrc === other.nrc;
    }
}
exports.FiscalIdentifiers = FiscalIdentifiers;
//# sourceMappingURL=fiscal-identifiers.js.map