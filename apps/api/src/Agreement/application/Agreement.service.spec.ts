import { AgreementService } from './Agreement.service';
import { IAgreementRepository } from '../domain/agreement.repository';
import { Agreement } from '../domain/agreement.aggregate';
import { Vendor } from '../domain/vendor.aggregate';
import { User } from '../../user/domain/user.aggregate';
import { Direction } from '../../direction/domain/direction';
import { Departement } from '../../direction/domain/departement';

import { AgreementType } from '../../core/types/agreement-type.enum';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/domain/errors';

// ── Typed mock factory ───────────────────────────────────────────────────────

function mockOf<T>(methods: (keyof T)[]): jest.Mocked<T> {
  return Object.fromEntries(
    methods.map((m) => [m, jest.fn()]),
  ) as jest.Mocked<T>;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeDirection(): Direction {
  const dept = Departement.create({
    id: 'dept-1',
    title: 'Dev',
    abriviation: 'DD',
    directionId: 'dir-1',
  });
  return Direction.create({
    id: 'dir-1',
    title: 'Tech',
    abriviation: 'TD',
    departements: [dept],
  });
}

function makeVendor(): Vendor {
  return Vendor.reconstitute({
    id: 'vendor-1',
    num: 'V-001',
    company_name: 'Acme',
    nif: 'NIF-1',
    nrc: 'NRC-1',
    address: '1 St',
    mobile_phone_number: '055',
    home_phone_number: '021',
    createdAt: new Date(),
  });
}

function makeAgreement(): Agreement {
  return Agreement.reconstitute({
    id: 'agr-1',
    number: 'CTR-001',
    type: AgreementType.CONTRACT,
    object: 'services',
    amount: 10000,
    expiration_date: new Date('2026-12-31'),
    signature_date: new Date('2024-01-01'),
    url: 'http://file',
    departementId: 'dept-1',
    directionId: 'dir-1',
    vendorId: 'vendor-1',
  });
}

function makeUser(): User {
  return User.reconstitute({
    id: 'user-1',
    email: 'u@x.com',
    username: 'u',
    firstName: 'U',
    lastName: 'U',
    departementId: 'dept-1',
    directionId: 'dir-1',
  });
}

function makeCreateDto(overrides: Record<string, unknown> = {}) {
  return {
    number: 'CTR-001',
    type: AgreementType.CONTRACT,
    object: 'IT services',
    amount: 50000,
    expiration_date: new Date('2026-12-31'),
    signature_date: new Date('2024-01-01'),
    url: 'http://file.pdf',
    directionId: 'dir-1',
    departementId: 'dept-1',
    vendorId: 'vendor-1',
    ...overrides,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AgreementService', () => {
  let agreementRepo: jest.Mocked<IAgreementRepository>;
  let vendorService: { findBy: jest.Mock };
  let directionService: { find: jest.Mock };
  let userService: { findBy: jest.Mock };
  let eventBus: { publishAll: jest.Mock };
  let service: AgreementService;

  beforeEach(() => {
    agreementRepo = mockOf<IAgreementRepository>([
      'save',
      'findById',
      'findByIdForExecution',
      'findOneByNumber',
      'findPaginated',
      'getStatusStats',
      'getTypeStats',
    ]);
    vendorService = { findBy: jest.fn() };
    directionService = { find: jest.fn() };
    userService = { findBy: jest.fn() };
    eventBus = { publishAll: jest.fn() };

    service = new AgreementService(
      agreementRepo,
      vendorService as any,
      directionService as any,
      userService as any,
      eventBus as any,
    );
  });

  // ── createAgreement ─────────────────────────────────────────────────────────

  describe('createAgreement', () => {
    describe('happy path', () => {
      beforeEach(() => {
        directionService.find.mockResolvedValue(makeDirection());
        vendorService.findBy.mockResolvedValue(makeVendor());
        agreementRepo.findOneByNumber.mockResolvedValue(null);
        agreementRepo.save.mockImplementation(async (a) => a);
      });

      it('saves the new agreement and publishes the created event', async () => {
        await service.createAgreement(makeCreateDto() as any);

        expect(agreementRepo.save).toHaveBeenCalledTimes(1);
        const saved: Agreement = agreementRepo.save.mock.calls[0][0];
        expect(saved).toBeInstanceOf(Agreement);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });

      it('resolves direction and vendor before checking number uniqueness', async () => {
        await service.createAgreement(makeCreateDto() as any);

        expect(directionService.find).toHaveBeenCalledWith('dir-1');
        expect(vendorService.findBy).toHaveBeenCalledWith({ id: 'vendor-1' });
        expect(agreementRepo.findOneByNumber).toHaveBeenCalledWith('CTR-001');
      });
    });

    describe('failure paths', () => {
      it('throws ValidationError when signature date is after expiration date', async () => {
        await expect(
          service.createAgreement(
            makeCreateDto({
              signature_date: new Date('2027-01-01'),
              expiration_date: new Date('2026-01-01'),
            }) as any,
          ),
        ).rejects.toThrow(ValidationError);

        expect(agreementRepo.save).not.toHaveBeenCalled();
      });

      it('throws NotFoundError when direction is not found', async () => {
        directionService.find.mockResolvedValue(null);
        vendorService.findBy.mockResolvedValue(makeVendor());

        await expect(
          service.createAgreement(makeCreateDto() as any),
        ).rejects.toThrow(NotFoundError);
        expect(agreementRepo.save).not.toHaveBeenCalled();
      });

      it('throws NotFoundError when vendor is not found', async () => {
        directionService.find.mockResolvedValue(makeDirection());
        vendorService.findBy.mockResolvedValue(null);

        await expect(
          service.createAgreement(makeCreateDto() as any),
        ).rejects.toThrow(NotFoundError);
        expect(agreementRepo.save).not.toHaveBeenCalled();
      });

      it('throws ConflictError when agreement number is already taken', async () => {
        directionService.find.mockResolvedValue(makeDirection());
        vendorService.findBy.mockResolvedValue(makeVendor());
        agreementRepo.findOneByNumber.mockResolvedValue(makeAgreement());

        await expect(
          service.createAgreement(makeCreateDto() as any),
        ).rejects.toThrow(ConflictError);
        expect(agreementRepo.save).not.toHaveBeenCalled();
      });

      it('propagates unexpected repository error', async () => {
        directionService.find.mockResolvedValue(makeDirection());
        vendorService.findBy.mockResolvedValue(makeVendor());
        agreementRepo.findOneByNumber.mockResolvedValue(null);
        agreementRepo.save.mockRejectedValue(new Error('db error'));

        await expect(
          service.createAgreement(makeCreateDto() as any),
        ).rejects.toThrow('db error');
      });
    });
  });

  // ── executeAgreement ────────────────────────────────────────────────────────

  describe('executeAgreement', () => {
    const execDto = {
      agreementId: 'agr-1',
      execution_start_date: new Date('2024-06-01'),
      execution_end_date: new Date('2025-06-01'),
      observation: 'on schedule',
    };

    describe('happy path', () => {
      it('calls execute on aggregate, saves, and publishes event', async () => {
        // Arrange
        const agreement = makeAgreement();
        const executeSpy = jest.spyOn(agreement, 'execute');
        agreementRepo.findByIdForExecution.mockResolvedValue(agreement);
        agreementRepo.save.mockImplementation(async (a) => a);

        // Act
        const result = await service.executeAgreement(execDto);

        // Assert
        expect(agreementRepo.findByIdForExecution).toHaveBeenCalledWith(
          'agr-1',
        );
        expect(executeSpy).toHaveBeenCalledWith(
          execDto.execution_start_date,
          execDto.execution_end_date,
          'on schedule',
        );
        expect(agreementRepo.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(Agreement);
      });

      it('defaults observation to empty string when omitted', async () => {
        const agreement = makeAgreement();
        const executeSpy = jest.spyOn(agreement, 'execute');
        agreementRepo.findByIdForExecution.mockResolvedValue(agreement);
        agreementRepo.save.mockImplementation(async (a) => a);

        await service.executeAgreement({
          agreementId: 'agr-1',
          execution_start_date: new Date('2024-06-01'),
          execution_end_date: new Date('2025-06-01'),
        } as any);

        expect(executeSpy).toHaveBeenCalledWith(
          expect.any(Date),
          expect.any(Date),
          '',
        );
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when agreement does not exist', async () => {
        agreementRepo.findByIdForExecution.mockResolvedValue(null);

        await expect(service.executeAgreement(execDto)).rejects.toThrow(
          NotFoundError,
        );
        expect(agreementRepo.save).not.toHaveBeenCalled();
        expect(eventBus.publishAll).not.toHaveBeenCalled();
      });

      it('propagates ConflictError when agreement is already executed', async () => {
        const alreadyExecuted = Agreement.reconstitute({
          ...makeAgreement(),
          execution_start_date: new Date('2024-01-01'),
          execution_end_date: new Date('2099-01-01'),
        } as any);
        agreementRepo.findByIdForExecution.mockResolvedValue(alreadyExecuted);

        await expect(service.executeAgreement(execDto)).rejects.toThrow(
          ConflictError,
        );
        expect(agreementRepo.save).not.toHaveBeenCalled();
      });
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('happy path – scopes query to the requesting user role and org', async () => {
      const user = makeUser();
      userService.findBy.mockResolvedValue(user);
      agreementRepo.findPaginated.mockResolvedValue({ total: 0, data: [] });

      await service.findAll({} as any, 'user-1');

      expect(agreementRepo.findPaginated).toHaveBeenCalledWith(
        {},
        user.role,
        user.departementId,
        user.directionId,
      );
    });
  });
});
