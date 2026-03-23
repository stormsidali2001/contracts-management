import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { typeOrmTestingModule } from 'src/test-utils/typeorm-testing';
import { VendorRepository } from './vendor.repository';
import { Vendor } from '../domain/vendor.aggregate';
import { VendorStat } from '../domain/vendor-stat';

describe('VendorRepository (integration)', () => {
  let module: TestingModule;
  let repo: VendorRepository;
  let dataSource: DataSource;

  const vendorIds: string[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        typeOrmTestingModule(),
        TypeOrmModule.forFeature([VendorEntity, VendorStatsEntity]),
      ],
      providers: [VendorRepository],
    }).compile();

    repo = module.get(VendorRepository);
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    if (vendorIds.length) {
      await dataSource.query(
        `DELETE FROM vendors WHERE id IN (${vendorIds.map(() => '?').join(',')})`,
        [...vendorIds],
      );
      vendorIds.length = 0;
    }
  });

  function buildProps() {
    const s = uuid().replace(/-/g, '').slice(0, 8);
    return {
      id: uuid(),
      num: `NUM-${s}`,
      company_name: `Co ${s}`,
      nif: `NIF-${s}`,
      nrc: `NRC-${s}`,
      address: '1 Test St',
      mobile_phone_number: '0551111111',
      home_phone_number: '0211111111',
      createdAt: new Date(),
    };
  }

  // ── save ─────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('returns a Vendor aggregate, never a TypeORM entity', async () => {
      const props = buildProps();
      vendorIds.push(props.id);

      const result = await repo.save(Vendor.create(props));

      expect(result).toBeInstanceOf(Vendor);
      expect(result).not.toBeInstanceOf(VendorEntity);
      expect(typeof result.pullEvents).toBe('function');
    });

    it('persists all scalar fields correctly', async () => {
      const props = buildProps();
      vendorIds.push(props.id);

      const result = await repo.save(Vendor.create(props));

      expect(result.id).toBe(props.id);
      expect(result.num).toBe(props.num);
      expect(result.company_name).toBe(props.company_name);
      expect(result.nif).toBe(props.nif);
      expect(result.nrc).toBe(props.nrc);
      expect(result.address).toBe(props.address);
      expect(result.mobile_phone_number).toBe(props.mobile_phone_number);
      expect(result.home_phone_number).toBe(props.home_phone_number);
    });

    it('persists an update to an existing vendor', async () => {
      const props = buildProps();
      vendorIds.push(props.id);
      const vendor = Vendor.create(props);
      await repo.save(vendor);

      vendor.update({ company_name: 'Updated Corp' });
      await repo.save(vendor);

      const found = await repo.findById(props.id);
      expect(found.company_name).toBe('Updated Corp');
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('reconstitutes a Vendor aggregate from the database', async () => {
      const props = buildProps();
      vendorIds.push(props.id);
      await repo.save(Vendor.create(props));

      const result = await repo.findById(props.id);

      expect(result).toBeInstanceOf(Vendor);
      expect(result).not.toBeInstanceOf(VendorEntity);
      expect(result.id).toBe(props.id);
      expect(result.nif).toBe(props.nif);
      expect(result.company_name).toBe(props.company_name);
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findById(uuid())).toBeNull();
    });
  });

  // ── findByUniqueCondition ─────────────────────────────────────────────────

  describe('findByUniqueCondition', () => {
    it('returns a Vendor aggregate when the condition matches', async () => {
      const props = buildProps();
      vendorIds.push(props.id);
      await repo.save(Vendor.create(props));

      const result = await repo.findByUniqueCondition('v.nif = :nif', { nif: props.nif });

      expect(result).toBeInstanceOf(Vendor);
      expect(result.id).toBe(props.id);
    });

    it('returns null when the condition does not match', async () => {
      const result = await repo.findByUniqueCondition(
        'v.nif = :nif',
        { nif: 'no-such-nif' },
      );
      expect(result).toBeNull();
    });
  });

  // ── findByIdWithRelationCounts ────────────────────────────────────────────

  describe('findByIdWithRelationCounts', () => {
    it('returns VendorWithCounts with zero counts for a vendor with no agreements', async () => {
      const props = buildProps();
      vendorIds.push(props.id);
      await repo.save(Vendor.create(props));

      const result = await repo.findByIdWithRelationCounts(props.id);

      expect(result).not.toBeNull();
      expect(result).not.toBeInstanceOf(VendorEntity);
      expect(result.id).toBe(props.id);
      expect(result.contractCount).toBe(0);
      expect(result.convensionCount).toBe(0);
    });
  });

  // ── findByIdWithAgreementCount ────────────────────────────────────────────

  describe('findByIdWithAgreementCount', () => {
    it('returns { vendor: Vendor, agreementCount: 0 } for a vendor with no agreements', async () => {
      const props = buildProps();
      vendorIds.push(props.id);
      await repo.save(Vendor.create(props));

      const result = await repo.findByIdWithAgreementCount(props.id);

      expect(result).not.toBeNull();
      expect(result.vendor).toBeInstanceOf(Vendor);
      expect(result.vendor).not.toBeInstanceOf(VendorEntity);
      expect(result.agreementCount).toBe(0);
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findByIdWithAgreementCount(uuid())).toBeNull();
    });
  });

  // ── getVendorStats ────────────────────────────────────────────────────────

  describe('getVendorStats', () => {
    it('returns plain VendorStat objects, not TypeORM entities', async () => {
      // Ensure a stat row exists by creating a vendor (save triggers increment)
      const props = buildProps();
      vendorIds.push(props.id);
      await repo.save(Vendor.create(props));

      const stats = await repo.getVendorStats();

      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);
      const stat = stats[0] as VendorStat;
      expect(stat).not.toBeInstanceOf(VendorStatsEntity);
      expect(stat).toHaveProperty('id');
      expect(stat).toHaveProperty('date');
      expect(stat).toHaveProperty('nb_vendors');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes the vendor so it can no longer be found', async () => {
      const props = buildProps();
      await repo.save(Vendor.create(props));
      // Do not add to vendorIds — we delete it in the test itself

      await repo.delete(props.id);

      expect(await repo.findById(props.id)).toBeNull();
    });
  });
});
