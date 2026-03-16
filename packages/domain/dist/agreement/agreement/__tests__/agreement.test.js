"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const agreement_1 = require("../agreement");
const agreement_status_1 = require("../value-objects/agreement-status");
const agreement_type_1 = require("../value-objects/agreement-type");
const execution_period_1 = require("../value-objects/execution-period");
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeAgreement(overrides = {}) {
    return agreement_1.Agreement.create({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        number: 'AGR-2024-001',
        type: agreement_type_1.AgreementTypeEnum.CONTRACT,
        object: 'Fourniture de matériel informatique',
        amount: 1500000,
        signatureDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-12-31'),
        url: 'upload/documents/agr-001.pdf',
        vendorId: 'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv',
        directionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        departementId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        ...overrides,
    });
}
function makeExecutionPeriod(startDate, endDate) {
    return new execution_period_1.ExecutionPeriod({ startDate, endDate });
}
// ─── Tests ──────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Agreement (Aggregate Root)', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('happy path – should create agreement with NOT_EXECUTED status and no execution job', () => {
            // Act
            const agreement = makeAgreement();
            // Assert
            (0, vitest_1.expect)(agreement.status.value).toBe(agreement_status_1.AgreementStatusEnum.NOT_EXECUTED);
            (0, vitest_1.expect)(agreement.executionJob).toBeNull();
            (0, vitest_1.expect)(agreement.executionPeriod).toBeNull();
            (0, vitest_1.expect)(agreement.number.value).toBe('AGR-2024-001');
            (0, vitest_1.expect)(agreement.amount.value).toBe(1500000);
            (0, vitest_1.expect)(agreement.type.value).toBe(agreement_type_1.AgreementTypeEnum.CONTRACT);
        });
        (0, vitest_1.it)('failure path – should throw when agreement number is empty', () => {
            (0, vitest_1.expect)(() => makeAgreement({ number: '' }))
                .toThrowError('Agreement number must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when amount is zero', () => {
            (0, vitest_1.expect)(() => makeAgreement({ amount: 0 }))
                .toThrowError('Money amount must be a positive number');
        });
        (0, vitest_1.it)('failure path – should throw when amount is negative', () => {
            (0, vitest_1.expect)(() => makeAgreement({ amount: -500 }))
                .toThrowError('Money amount must be a positive number');
        });
        (0, vitest_1.it)('failure path – should throw when signature date is after expiration date', () => {
            (0, vitest_1.expect)(() => makeAgreement({
                signatureDate: new Date('2024-12-31'),
                expirationDate: new Date('2024-01-01'),
            })).toThrowError('Signature date must not be after expiration date');
        });
    });
    (0, vitest_1.describe)('execute', () => {
        (0, vitest_1.it)('happy path – should transition to IN_EXECUTION when execution starts before expiration', () => {
            // Arrange
            const agreement = makeAgreement({
                signatureDate: new Date('2024-01-01'),
                expirationDate: new Date('2024-12-31'),
            });
            const executionPeriod = makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30'));
            // Act
            agreement.execute(executionPeriod);
            // Assert
            (0, vitest_1.expect)(agreement.status.value).toBe(agreement_status_1.AgreementStatusEnum.IN_EXECUTION);
            (0, vitest_1.expect)(agreement.executionPeriod).not.toBeNull();
            (0, vitest_1.expect)(agreement.executionJob).not.toBeNull();
            (0, vitest_1.expect)(agreement.executionJob.newStatus).toBe(agreement_status_1.AgreementStatusEnum.EXECUTED);
            (0, vitest_1.expect)(agreement.executionJob.date).toEqual(new Date('2024-09-30'));
        });
        (0, vitest_1.it)('happy path – should transition to IN_EXECUTION_WITH_DELAY when execution starts after expiration', () => {
            // Arrange
            const agreement = makeAgreement({
                signatureDate: new Date('2024-01-01'),
                expirationDate: new Date('2024-06-30'),
            });
            const executionPeriod = makeExecutionPeriod(new Date('2024-07-01'), // after expiration → delayed
            new Date('2024-10-31'));
            // Act
            agreement.execute(executionPeriod);
            // Assert
            (0, vitest_1.expect)(agreement.status.value).toBe(agreement_status_1.AgreementStatusEnum.IN_EXECUTION_WITH_DELAY);
            (0, vitest_1.expect)(agreement.executionJob.newStatus).toBe(agreement_status_1.AgreementStatusEnum.EXECUTED_WITH_DELAY);
        });
        (0, vitest_1.it)('happy path – job name follows the "agreement:{type}:{id}" format', () => {
            // Arrange
            const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
            const agreement = makeAgreement({ id, type: agreement_type_1.AgreementTypeEnum.CONTRACT });
            // Act
            agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));
            // Assert
            (0, vitest_1.expect)(agreement.executionJob.name).toBe(`agreement:contract:${id}`);
        });
        (0, vitest_1.it)('failure path – should throw when agreement is already in execution', () => {
            const agreement = makeAgreement();
            agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));
            (0, vitest_1.expect)(() => agreement.execute(makeExecutionPeriod(new Date('2024-07-01'), new Date('2024-10-31')))).toThrowError('cannot be executed in status');
        });
        (0, vitest_1.it)('failure path – should throw when execution starts before contract signature date', () => {
            const agreement = makeAgreement({ signatureDate: new Date('2024-06-01') });
            (0, vitest_1.expect)(() => agreement.execute(makeExecutionPeriod(new Date('2024-01-01'), new Date('2024-09-30')))).toThrowError('Execution cannot start before the contract signature date');
        });
        (0, vitest_1.it)('failure path – should throw when execution start equals end date', () => {
            const agreement = makeAgreement();
            const sameDay = new Date('2024-06-01');
            (0, vitest_1.expect)(() => makeExecutionPeriod(sameDay, sameDay))
                .toThrowError('Execution start date must be before end date');
        });
    });
    (0, vitest_1.describe)('completeExecution', () => {
        (0, vitest_1.it)('happy path – should transition from IN_EXECUTION to EXECUTED and clear job', () => {
            // Arrange
            const agreement = makeAgreement();
            agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));
            // Act
            agreement.completeExecution();
            // Assert
            (0, vitest_1.expect)(agreement.status.value).toBe(agreement_status_1.AgreementStatusEnum.EXECUTED);
            (0, vitest_1.expect)(agreement.executionJob).toBeNull();
        });
        (0, vitest_1.it)('happy path – should transition from IN_EXECUTION_WITH_DELAY to EXECUTED_WITH_DELAY', () => {
            // Arrange
            const agreement = makeAgreement({
                signatureDate: new Date('2024-01-01'),
                expirationDate: new Date('2024-06-30'),
            });
            agreement.execute(makeExecutionPeriod(new Date('2024-07-01'), new Date('2024-10-31')));
            // Act
            agreement.completeExecution();
            // Assert
            (0, vitest_1.expect)(agreement.status.value).toBe(agreement_status_1.AgreementStatusEnum.EXECUTED_WITH_DELAY);
            (0, vitest_1.expect)(agreement.executionJob).toBeNull();
        });
        (0, vitest_1.it)('failure path – should throw when trying to complete a NOT_EXECUTED agreement', () => {
            const agreement = makeAgreement();
            (0, vitest_1.expect)(() => agreement.completeExecution())
                .toThrowError('Cannot complete execution from');
        });
    });
    (0, vitest_1.describe)('canBeExecuted', () => {
        (0, vitest_1.it)('happy path – returns true for NOT_EXECUTED agreement', () => {
            (0, vitest_1.expect)(makeAgreement().canBeExecuted()).toBe(true);
        });
        (0, vitest_1.it)('failure path – returns false after execution starts', () => {
            const agreement = makeAgreement();
            agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));
            (0, vitest_1.expect)(agreement.canBeExecuted()).toBe(false);
        });
    });
});
//# sourceMappingURL=agreement.test.js.map