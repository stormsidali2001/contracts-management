import { describe, it, expect } from '@jest/globals';
import { Agreement } from './agreement.aggregate';
import { AgreementCreatedEvent } from './events/agreement-created.event';
import { AgreementExecutedEvent } from './events/agreement-executed.event';
import { AgreementType } from '../../core/types/agreement-type.enum';
import { AgreementStatus } from '../../core/types/agreement-status.enum';

function makeProps(
  overrides: Partial<Parameters<typeof Agreement.create>[0]> = {},
) {
  return {
    id: 'agr-1',
    number: 'CTR-001',
    type: AgreementType.CONTRACT,
    object: 'Software development services',
    amount: 50000,
    expiration_date: new Date('2025-12-31'),
    signature_date: new Date('2024-01-01'),
    url: 'https://files/agr-1.pdf',
    departementId: 'dept-1',
    directionId: 'dir-1',
    vendorId: 'vendor-1',
    ...overrides,
  };
}

function createAgreement(
  overrides: Partial<Parameters<typeof Agreement.create>[0]> = {},
) {
  return Agreement.create(makeProps(overrides));
}

describe('Agreement (Aggregate Root)', () => {
  describe('create', () => {
    it('happy path – should set all props and default type to CONTRACT', () => {
      // Arrange + Act
      const agreement = Agreement.create(makeProps({ type: undefined }));

      // Assert
      expect(agreement.id).toBe('agr-1');
      expect(agreement.type).toBe(AgreementType.CONTRACT);
      expect(agreement.status).toBe(AgreementStatus.NOT_EXECUTED);
      expect(agreement.object).toBe('Software development services');
      expect(agreement.amount).toBe(50000);
    });

    it('happy path – should emit AgreementCreatedEvent with correct ids', () => {
      // Act
      const agreement = createAgreement();

      // Assert
      const events = agreement.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as AgreementCreatedEvent;
      expect(event).toBeInstanceOf(AgreementCreatedEvent);
      expect(event.agreementId).toBe('agr-1');
      expect(event.type).toBe(AgreementType.CONTRACT);
      expect(event.departementId).toBe('dept-1');
      expect(event.directionId).toBe('dir-1');
      expect(event.vendorId).toBe('vendor-1');
    });
  });

  describe('reconstitute', () => {
    it('happy path – should not emit any events', () => {
      // Act
      const agreement = Agreement.reconstitute(makeProps());

      // Assert
      expect(agreement.pullEvents()).toHaveLength(0);
    });
  });

  describe('status (derived getter)', () => {
    it('happy path – should be NOT_EXECUTED when no execution dates set', () => {
      const agreement = createAgreement();
      expect(agreement.status).toBe(AgreementStatus.NOT_EXECUTED);
    });

    it('happy path – should be IN_EXECUTION when start date is before expiration and end date is in the future', () => {
      const agreement = Agreement.reconstitute(
        makeProps({
          signature_date: new Date('2024-01-01'),
          expiration_date: new Date('2099-12-31'),
          execution_start_date: new Date('2024-06-01'),
          execution_end_date: new Date('2099-11-30'),
        }),
      );
      expect(agreement.status).toBe(AgreementStatus.IN_EXECUTION);
    });

    it('happy path – should be IN_EXECUTION_WITH_DELAY when start is after expiration and end is in the future', () => {
      const agreement = Agreement.reconstitute(
        makeProps({
          signature_date: new Date('2020-01-01'),
          expiration_date: new Date('2020-06-01'),
          execution_start_date: new Date('2021-01-01'),
          execution_end_date: new Date('2099-12-31'),
        }),
      );
      expect(agreement.status).toBe(AgreementStatus.IN_EXECUTION_WITH_DELAY);
    });

    it('happy path – should be EXECUTED when completed on time', () => {
      const agreement = Agreement.reconstitute(
        makeProps({
          signature_date: new Date('2020-01-01'),
          expiration_date: new Date('2022-12-31'),
          execution_start_date: new Date('2021-01-01'),
          execution_end_date: new Date('2021-12-31'),
        }),
      );
      expect(agreement.status).toBe(AgreementStatus.EXECUTED);
    });

    it('happy path – should be EXECUTED_WITH_DELAY when completed but start was after expiration', () => {
      const agreement = Agreement.reconstitute(
        makeProps({
          signature_date: new Date('2020-01-01'),
          expiration_date: new Date('2020-06-01'),
          execution_start_date: new Date('2021-01-01'),
          execution_end_date: new Date('2021-06-01'),
        }),
      );
      expect(agreement.status).toBe(AgreementStatus.EXECUTED_WITH_DELAY);
    });
  });

  describe('execute', () => {
    it('happy path – should set execution dates and emit AgreementExecutedEvent', () => {
      // Arrange
      const agreement = createAgreement({
        signature_date: new Date('2024-01-01'),
      });
      agreement.pullEvents(); // clear creation event

      const start = new Date('2024-06-01');
      const end = new Date('2025-06-01');

      // Act
      agreement.execute(start, end, 'On schedule');

      // Assert
      expect(agreement.execution_start_date).toEqual(start);
      expect(agreement.execution_end_date).toEqual(end);
      expect(agreement.observation).toBe('On schedule');

      const events = agreement.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as AgreementExecutedEvent;
      expect(event).toBeInstanceOf(AgreementExecutedEvent);
      expect(event.agreementId).toBe('agr-1');
      expect(event.departementId).toBe('dept-1');
      expect(event.directionId).toBe('dir-1');
    });

    it('failure path – should throw ConflictError when agreement is already executed', () => {
      // Arrange
      const agreement = createAgreement({
        signature_date: new Date('2024-01-01'),
      });
      agreement.execute(new Date('2024-06-01'), new Date('2025-06-01'), '');

      // Act + Assert
      expect(() =>
        agreement.execute(new Date('2024-07-01'), new Date('2025-07-01'), ''),
      ).toThrow('agreement is already executed');
    });

    it('failure path – should throw ValidationError when start date is after end date', () => {
      // Arrange
      const agreement = createAgreement({
        signature_date: new Date('2024-01-01'),
      });

      // Act + Assert
      expect(() =>
        agreement.execute(new Date('2025-01-01'), new Date('2024-01-01'), ''),
      ).toThrow("l'intervalle d'execution est non valide");
    });

    it('failure path – should throw ValidationError when start date is before signature date', () => {
      // Arrange
      const agreement = createAgreement({
        signature_date: new Date('2024-06-01'),
      });

      // Act + Assert
      expect(() =>
        agreement.execute(new Date('2024-01-01'), new Date('2025-01-01'), ''),
      ).toThrow(
        "la date de debut d'execution dout etre supperieur ou rgale a la date de signature",
      );
    });
  });
});
