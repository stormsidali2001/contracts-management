"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPeriod = void 0;
class ExecutionPeriod {
    constructor(props) {
        if (props.startDate >= props.endDate) {
            throw new Error('Execution start date must be before end date');
        }
        this.startDate = new Date(props.startDate.getTime());
        this.endDate = new Date(props.endDate.getTime());
    }
    equals(other) {
        return (this.startDate.getTime() === other.startDate.getTime() &&
            this.endDate.getTime() === other.endDate.getTime());
    }
}
exports.ExecutionPeriod = ExecutionPeriod;
//# sourceMappingURL=execution-period.js.map