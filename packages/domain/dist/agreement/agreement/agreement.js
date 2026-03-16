"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agreement = void 0;
const aggregate_root_1 = require("../../shared/aggregate-root");
const created_at_1 = require("../../shared/value-objects/created-at");
const agreement_execution_job_1 = require("./entities/agreement-execution-job");
const agreement_execution_service_1 = require("./services/agreement-execution.service");
const agreement_id_1 = require("./value-objects/agreement-id");
const agreement_number_1 = require("./value-objects/agreement-number");
const agreement_status_1 = require("./value-objects/agreement-status");
const agreement_type_1 = require("./value-objects/agreement-type");
const contract_period_1 = require("./value-objects/contract-period");
const document_url_1 = require("./value-objects/document-url");
const money_amount_1 = require("./value-objects/money-amount");
const observation_1 = require("./value-objects/observation");
class Agreement extends aggregate_root_1.AggregateRoot {
    constructor(props) {
        super(props.id);
        this._number = props.number;
        this._type = props.type;
        this._object = props.object;
        this._amount = props.amount;
        this._contractPeriod = props.contractPeriod;
        this._executionPeriod = props.executionPeriod;
        this._status = props.status;
        this._documentUrl = props.documentUrl;
        this._observation = props.observation;
        this.vendorId = props.vendorId;
        this.directionId = props.directionId;
        this.departementId = props.departementId;
        this.createdAt = props.createdAt;
        this._executionJob = props.executionJob;
    }
    static create(props) {
        return new Agreement({
            id: new agreement_id_1.AgreementId(props.id),
            number: new agreement_number_1.AgreementNumber(props.number),
            type: new agreement_type_1.AgreementType(props.type),
            object: props.object,
            amount: new money_amount_1.MoneyAmount(props.amount),
            contractPeriod: new contract_period_1.ContractPeriod({
                signatureDate: props.signatureDate,
                expirationDate: props.expirationDate,
            }),
            executionPeriod: null,
            status: new agreement_status_1.AgreementStatus(agreement_status_1.AgreementStatusEnum.NOT_EXECUTED),
            documentUrl: new document_url_1.DocumentUrl(props.url),
            observation: new observation_1.Observation(props.observation),
            vendorId: props.vendorId,
            directionId: props.directionId,
            departementId: props.departementId,
            createdAt: new created_at_1.CreatedAt(),
            executionJob: null,
        });
    }
    static reconstitute(props) {
        return new Agreement(props);
    }
    get number() { return this._number; }
    get type() { return this._type; }
    get object() { return this._object; }
    get amount() { return this._amount; }
    get contractPeriod() { return this._contractPeriod; }
    get executionPeriod() { return this._executionPeriod; }
    get status() { return this._status; }
    get documentUrl() { return this._documentUrl; }
    get observation() { return this._observation; }
    get executionJob() { return this._executionJob; }
    canBeExecuted() {
        return this._status.isNotExecuted();
    }
    execute(executionPeriod) {
        if (!this.canBeExecuted()) {
            throw new Error(`Agreement "${this._number.value}" cannot be executed in status "${this._status.value}"`);
        }
        agreement_execution_service_1.AgreementExecutionService.validateExecutionPeriod(this._contractPeriod, executionPeriod);
        const { inExecutionStatus, targetStatus } = agreement_execution_service_1.AgreementExecutionService.computeExecutionDecision(this._contractPeriod, executionPeriod);
        this._executionPeriod = executionPeriod;
        this._status = new agreement_status_1.AgreementStatus(inExecutionStatus);
        this._executionJob = agreement_execution_job_1.AgreementExecutionJob.create(this.getId().value, this._type.value, executionPeriod.endDate, targetStatus);
    }
    /** Called by cron when execution end_date is reached */
    completeExecution() {
        this._status = this._status.transitionToCompleted();
        this._executionJob = null;
    }
    clearExecutionJob() {
        this._executionJob = null;
    }
}
exports.Agreement = Agreement;
//# sourceMappingURL=agreement.js.map