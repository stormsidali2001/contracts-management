import { SeedService } from './seed.service';
import { AgreementType } from 'src/core/types/agreement-type.enum';

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeDirections() {
  return [
    {
      id: 'dir-1',
      departements: [{ id: 'dept-1' }, { id: 'dept-2' }],
    },
  ];
}

function makeVendorsPage() {
  return {
    data: [{ id: 'vendor-1' }, { id: 'vendor-2' }],
    total: 2,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('SeedService.seedAgreements', () => {
  let directionService: { findAll: jest.Mock };
  let vendorService: { findAll: jest.Mock };
  let agreementService: {
    createAgreement: jest.Mock;
    executeAgreement: jest.Mock;
  };
  let authService: { register: jest.Mock };
  let service: SeedService;

  beforeEach(() => {
    directionService = {
      findAll: jest.fn().mockResolvedValue(makeDirections()),
    };
    vendorService = { findAll: jest.fn().mockResolvedValue(makeVendorsPage()) };
    agreementService = {
      createAgreement: jest.fn(),
      executeAgreement: jest.fn().mockResolvedValue({}),
    };
    authService = { register: jest.fn() };

    let createCallIndex = 0;
    agreementService.createAgreement.mockImplementation(() =>
      Promise.resolve({ id: `agr-${createCallIndex++}` }),
    );

    service = new SeedService(
      directionService as any,
      vendorService as any,
      agreementService as any,
      authService as any,
    );
  });

  it('calls createAgreement exactly count times', async () => {
    // Arrange + Act
    await service.seedAgreements(10);

    // Assert
    expect(agreementService.createAgreement).toHaveBeenCalledTimes(10);
  });

  it('calls executeAgreement for 4 out of every 5 agreements (all non-NOT_EXECUTED slots)', async () => {
    // Arrange + Act — seed 5 agreements (one full rotation of all 5 status slots)
    await service.seedAgreements(5);

    // Assert — statusSlot 0 is NOT_EXECUTED so gets no executeAgreement call
    expect(agreementService.executeAgreement).toHaveBeenCalledTimes(4);
  });

  it('scales execute calls proportionally for multiples of 5', async () => {
    // Arrange + Act
    await service.seedAgreements(15);

    // Assert — 15 * 4/5 = 12 execute calls
    expect(agreementService.createAgreement).toHaveBeenCalledTimes(15);
    expect(agreementService.executeAgreement).toHaveBeenCalledTimes(12);
  });

  it('does not call executeAgreement for the NOT_EXECUTED slot (i % 5 === 0)', async () => {
    // Arrange + Act — seed exactly 5 so we get one of each slot
    await service.seedAgreements(5);

    // The first agreement created (agr-0) is the NOT_EXECUTED slot — its id
    // must not appear in any executeAgreement call.
    const executedIds: string[] =
      agreementService.executeAgreement.mock.calls.map(
        ([dto]: [{ agreementId: string }]) => dto.agreementId,
      );
    expect(executedIds).not.toContain('agr-0');
  });

  it('passes a valid execution_start_date and execution_end_date for each executed agreement', async () => {
    // Arrange + Act
    await service.seedAgreements(5);

    for (const [dto] of agreementService.executeAgreement.mock.calls as [
      { execution_start_date: string; execution_end_date: string },
    ][]) {
      expect(dto.execution_start_date).toBeTruthy();
      expect(dto.execution_end_date).toBeTruthy();
      const start = new Date(dto.execution_start_date);
      const end = new Date(dto.execution_end_date);
      expect(start.getTime()).toBeLessThan(end.getTime());
    }
  });

  it('seeds all agreement types (CONTRACT and CONVENSION) across the batch', async () => {
    // Arrange + Act — seed a large batch to hit both branches of Math.random() > 0.5
    await service.seedAgreements(20);

    const types = agreementService.createAgreement.mock.calls.map(
      ([dto]: [{ type: AgreementType }]) => dto.type,
    );
    expect(types).toContain(AgreementType.CONTRACT);
    expect(types).toContain(AgreementType.CONVENSION);
  });
});
