import { VendorService } from './vendor.service';
import { IVendorRepository } from '../domain/vendor.repository';
import { Vendor } from '../domain/vendor.aggregate';
import { VendorStatsRepository } from '../infrastructure/vendor-stats.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/domain/errors';

// ── Typed mock factory ───────────────────────────────────────────────────────

function mockOf<T>(methods: (keyof T)[]): jest.Mocked<T> {
  return Object.fromEntries(methods.map((m) => [m, jest.fn()])) as jest.Mocked<T>;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeVendor(): Vendor {
  return Vendor.reconstitute({
    id: 'vendor-1', num: 'V-001', company_name: 'Acme', nif: 'NIF-1', nrc: 'NRC-1',
    address: '1 St', mobile_phone_number: '055', home_phone_number: '021', createdAt: new Date(),
  });
}

function makeCreateDto(overrides: Record<string, unknown> = {}) {
  return {
    num: 'V-001', company_name: 'Acme', nif: 'NIF-1', nrc: 'NRC-1',
    address: '1 St', mobile_phone_number: '055', home_phone_number: '021',
    createdAt: new Date(),
    ...overrides,
  };
}

function makeUpdateDto(overrides: Record<string, unknown> = {}) {
  return { company_name: 'NewCorp', ...overrides };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('VendorService', () => {
  let vendorRepo: jest.Mocked<IVendorRepository>;
  let statsRepo: jest.Mocked<Pick<VendorStatsRepository, 'incrementForDate'>>;
  let eventBus: { publishAll: jest.Mock };
  let service: VendorService;

  beforeEach(() => {
    vendorRepo = mockOf<IVendorRepository>([
      'save', 'delete', 'findById', 'findByUniqueCondition',
      'findByIdWithRelationCounts', 'findByIdWithAgreementCount',
      'findPaginated', 'getVendorStats',
    ]);
    statsRepo = { incrementForDate: jest.fn().mockResolvedValue(undefined) };
    eventBus = { publishAll: jest.fn() };

    service = new VendorService(vendorRepo, statsRepo as any, eventBus as any);
  });

  // ── createVendor ────────────────────────────────────────────────────────────

  describe('createVendor', () => {
    describe('happy path', () => {
      beforeEach(() => {
        vendorRepo.findByUniqueCondition.mockResolvedValue(null);
        vendorRepo.save.mockImplementation(async (v) => v);
      });

      it('saves new vendor, increments stats, and publishes created event', async () => {
        await service.createVendor(makeCreateDto() as any);

        expect(vendorRepo.save).toHaveBeenCalledTimes(1);
        const saved: Vendor = vendorRepo.save.mock.calls[0][0];
        expect(saved).toBeInstanceOf(Vendor);

        expect(statsRepo.incrementForDate).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });

      it('checks uniqueness before saving', async () => {
        await service.createVendor(makeCreateDto() as any);

        expect(vendorRepo.findByUniqueCondition).toHaveBeenCalledTimes(1);
      });
    });

    describe('failure paths', () => {
      it('throws ConflictError when a vendor with same unique fields exists', async () => {
        vendorRepo.findByUniqueCondition.mockResolvedValue(makeVendor());

        await expect(service.createVendor(makeCreateDto() as any)).rejects.toThrow(ConflictError);
        expect(vendorRepo.save).not.toHaveBeenCalled();
        expect(statsRepo.incrementForDate).not.toHaveBeenCalled();
      });

      it('propagates repository error during save', async () => {
        vendorRepo.findByUniqueCondition.mockResolvedValue(null);
        vendorRepo.save.mockRejectedValue(new Error('db error'));

        await expect(service.createVendor(makeCreateDto() as any)).rejects.toThrow('db error');
      });
    });
  });

  // ── updateVendor ────────────────────────────────────────────────────────────

  describe('updateVendor', () => {
    describe('happy path', () => {
      it('loads vendor, applies update, saves, and publishes updated event', async () => {
        const vendor = makeVendor();
        const updateSpy = jest.spyOn(vendor, 'update');
        vendorRepo.findByUniqueCondition.mockResolvedValue(null);
        vendorRepo.findById.mockResolvedValue(vendor);
        vendorRepo.save.mockImplementation(async (v) => v);

        await service.updateVendor('vendor-1', makeUpdateDto() as any);

        expect(vendorRepo.findById).toHaveBeenCalledWith('vendor-1');
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(vendorRepo.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when vendor does not exist', async () => {
        vendorRepo.findByUniqueCondition.mockResolvedValue(null);
        vendorRepo.findById.mockResolvedValue(null);

        await expect(service.updateVendor('missing', makeUpdateDto() as any)).rejects.toThrow(NotFoundError);
        expect(vendorRepo.save).not.toHaveBeenCalled();
      });

      it('throws ConflictError when unique fields conflict with a different vendor', async () => {
        const otherVendor = Vendor.reconstitute({ ...makeVendor(), id: 'vendor-2' } as any);
        vendorRepo.findByUniqueCondition.mockResolvedValue(otherVendor);

        await expect(service.updateVendor('vendor-1', makeUpdateDto() as any)).rejects.toThrow(ConflictError);
        expect(vendorRepo.save).not.toHaveBeenCalled();
      });
    });
  });

  // ── deleteVendor ────────────────────────────────────────────────────────────

  describe('deleteVendor', () => {
    describe('happy path', () => {
      it('deletes vendor and publishes deleted event', async () => {
        vendorRepo.findByIdWithAgreementCount.mockResolvedValue({
          vendor: makeVendor(),
          agreementCount: 0,
        });
        vendorRepo.delete.mockResolvedValue(undefined);

        await service.deleteVendor('vendor-1');

        expect(vendorRepo.delete).toHaveBeenCalledWith('vendor-1');
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when vendor does not exist', async () => {
        vendorRepo.findByIdWithAgreementCount.mockResolvedValue(null);

        await expect(service.deleteVendor('missing')).rejects.toThrow(NotFoundError);
        expect(vendorRepo.delete).not.toHaveBeenCalled();
      });

      it('throws ForbiddenError when vendor has linked agreements', async () => {
        vendorRepo.findByIdWithAgreementCount.mockResolvedValue({
          vendor: makeVendor(),
          agreementCount: 3,
        });

        await expect(service.deleteVendor('vendor-1')).rejects.toThrow(ForbiddenError);
        expect(vendorRepo.delete).not.toHaveBeenCalled();
      });
    });
  });
});
