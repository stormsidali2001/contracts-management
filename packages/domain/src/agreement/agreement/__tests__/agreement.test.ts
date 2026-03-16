import { describe, it, expect } from 'vitest';
import { Agreement } from '../agreement';
import { AgreementStatusEnum } from '../value-objects/agreement-status';
import { AgreementTypeEnum } from '../value-objects/agreement-type';
import { ExecutionPeriod } from '../value-objects/execution-period';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeAgreement(overrides: Partial<Parameters<typeof Agreement.create>[0]> = {}): Agreement {
  return Agreement.create({
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    number: 'AGR-2024-001',
    type: AgreementTypeEnum.CONTRACT,
    object: 'Fourniture de matériel informatique',
    amount: 1_500_000,
    signatureDate: new Date('2024-01-01'),
    expirationDate: new Date('2024-12-31'),
    url: 'upload/documents/agr-001.pdf',
    vendorId: 'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv',
    directionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    departementId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    ...overrides,
  });
}

function makeExecutionPeriod(startDate: Date, endDate: Date): ExecutionPeriod {
  return new ExecutionPeriod({ startDate, endDate });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Agreement (Aggregate Root)', () => {

  describe('create', () => {
    it('happy path – should create agreement with NOT_EXECUTED status and no execution job', () => {
      // Act
      const agreement = makeAgreement();

      // Assert
      expect(agreement.status.value).toBe(AgreementStatusEnum.NOT_EXECUTED);
      expect(agreement.executionJob).toBeNull();
      expect(agreement.executionPeriod).toBeNull();
      expect(agreement.number.value).toBe('AGR-2024-001');
      expect(agreement.amount.value).toBe(1_500_000);
      expect(agreement.type.value).toBe(AgreementTypeEnum.CONTRACT);
    });

    it('failure path – should throw when agreement number is empty', () => {
      expect(() => makeAgreement({ number: '' }))
        .toThrowError('Agreement number must not be empty');
    });

    it('failure path – should throw when amount is zero', () => {
      expect(() => makeAgreement({ amount: 0 }))
        .toThrowError('Money amount must be a positive number');
    });

    it('failure path – should throw when amount is negative', () => {
      expect(() => makeAgreement({ amount: -500 }))
        .toThrowError('Money amount must be a positive number');
    });

    it('failure path – should throw when signature date is after expiration date', () => {
      expect(() =>
        makeAgreement({
          signatureDate: new Date('2024-12-31'),
          expirationDate: new Date('2024-01-01'),
        }),
      ).toThrowError('Signature date must not be after expiration date');
    });
  });

  describe('execute', () => {
    it('happy path – should transition to IN_EXECUTION when execution starts before expiration', () => {
      // Arrange
      const agreement = makeAgreement({
        signatureDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-12-31'),
      });
      const executionPeriod = makeExecutionPeriod(
        new Date('2024-06-01'),
        new Date('2024-09-30'),
      );

      // Act
      agreement.execute(executionPeriod);

      // Assert
      expect(agreement.status.value).toBe(AgreementStatusEnum.IN_EXECUTION);
      expect(agreement.executionPeriod).not.toBeNull();
      expect(agreement.executionJob).not.toBeNull();
      expect(agreement.executionJob!.newStatus).toBe(AgreementStatusEnum.EXECUTED);
      expect(agreement.executionJob!.date).toEqual(new Date('2024-09-30'));
    });

    it('happy path – should transition to IN_EXECUTION_WITH_DELAY when execution starts after expiration', () => {
      // Arrange
      const agreement = makeAgreement({
        signatureDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-06-30'),
      });
      const executionPeriod = makeExecutionPeriod(
        new Date('2024-07-01'), // after expiration → delayed
        new Date('2024-10-31'),
      );

      // Act
      agreement.execute(executionPeriod);

      // Assert
      expect(agreement.status.value).toBe(AgreementStatusEnum.IN_EXECUTION_WITH_DELAY);
      expect(agreement.executionJob!.newStatus).toBe(AgreementStatusEnum.EXECUTED_WITH_DELAY);
    });

    it('happy path – job name follows the "agreement:{type}:{id}" format', () => {
      // Arrange
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const agreement = makeAgreement({ id, type: AgreementTypeEnum.CONTRACT });

      // Act
      agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));

      // Assert
      expect(agreement.executionJob!.name).toBe(`agreement:contract:${id}`);
    });

    it('failure path – should throw when agreement is already in execution', () => {
      const agreement = makeAgreement();
      agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));

      expect(() =>
        agreement.execute(makeExecutionPeriod(new Date('2024-07-01'), new Date('2024-10-31'))),
      ).toThrowError('cannot be executed in status');
    });

    it('failure path – should throw when execution starts before contract signature date', () => {
      const agreement = makeAgreement({ signatureDate: new Date('2024-06-01') });

      expect(() =>
        agreement.execute(
          makeExecutionPeriod(new Date('2024-01-01'), new Date('2024-09-30')),
        ),
      ).toThrowError('Execution cannot start before the contract signature date');
    });

    it('failure path – should throw when execution start equals end date', () => {
      const agreement = makeAgreement();
      const sameDay = new Date('2024-06-01');

      expect(() => makeExecutionPeriod(sameDay, sameDay))
        .toThrowError('Execution start date must be before end date');
    });
  });

  describe('completeExecution', () => {
    it('happy path – should transition from IN_EXECUTION to EXECUTED and clear job', () => {
      // Arrange
      const agreement = makeAgreement();
      agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));

      // Act
      agreement.completeExecution();

      // Assert
      expect(agreement.status.value).toBe(AgreementStatusEnum.EXECUTED);
      expect(agreement.executionJob).toBeNull();
    });

    it('happy path – should transition from IN_EXECUTION_WITH_DELAY to EXECUTED_WITH_DELAY', () => {
      // Arrange
      const agreement = makeAgreement({
        signatureDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-06-30'),
      });
      agreement.execute(makeExecutionPeriod(new Date('2024-07-01'), new Date('2024-10-31')));

      // Act
      agreement.completeExecution();

      // Assert
      expect(agreement.status.value).toBe(AgreementStatusEnum.EXECUTED_WITH_DELAY);
      expect(agreement.executionJob).toBeNull();
    });

    it('failure path – should throw when trying to complete a NOT_EXECUTED agreement', () => {
      const agreement = makeAgreement();

      expect(() => agreement.completeExecution())
        .toThrowError('Cannot complete execution from');
    });
  });

  describe('canBeExecuted', () => {
    it('happy path – returns true for NOT_EXECUTED agreement', () => {
      expect(makeAgreement().canBeExecuted()).toBe(true);
    });

    it('failure path – returns false after execution starts', () => {
      const agreement = makeAgreement();
      agreement.execute(makeExecutionPeriod(new Date('2024-06-01'), new Date('2024-09-30')));

      expect(agreement.canBeExecuted()).toBe(false);
    });
  });
});
