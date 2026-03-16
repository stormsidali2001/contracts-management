"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementExecutionJob = void 0;
const entity_1 = require("../../../shared/entity");
class AgreementExecutionJob extends entity_1.Entity {
    constructor(props) {
        super(props.id);
        this.agreementId = props.agreementId;
        this.name = props.name;
        this.date = new Date(props.date.getTime());
        this.newStatus = props.newStatus;
    }
    static create(agreementId, agreementType, scheduledDate, newStatus) {
        return new AgreementExecutionJob({
            id: null, // assigned by DB on insert
            agreementId,
            agreementType,
            name: `agreement:${agreementType}:${agreementId}`,
            date: scheduledDate,
            newStatus,
        });
    }
    static reconstitute(props) {
        return new AgreementExecutionJob(props);
    }
}
exports.AgreementExecutionJob = AgreementExecutionJob;
//# sourceMappingURL=agreement-execution-job.js.map