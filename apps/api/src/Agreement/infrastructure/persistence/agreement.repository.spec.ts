import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { typeOrmTestingModule } from 'src/test-utils/typeorm-testing';
import { AgreementRepository } from './agreement.repository';
import { Agreement } from '../../domain/agreement.aggregate';
import { AgreementType } from 'src/core/types/agreement-type.enum';

describe('AgreementRepository (integration)', () => {
  let module: TestingModule;
  let repo: AgreementRepository;
  let dataSource: DataSource;

  // FK prerequisites shared across all tests in this suite
  let vendorId: string;
  let directionId: string;
  let departementId: string;

  const agreementIds: string[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        typeOrmTestingModule(),
        TypeOrmModule.forFeature([AgreementEntity]),
      ],
      providers: [AgreementRepository],
    }).compile();

    repo = module.get(AgreementRepository);
    dataSource = module.get(DataSource);

    // Insert prerequisite rows directly — no services, just raw SQL
    const s = uuid().replace(/-/g, '').slice(0, 8);
    directionId = uuid();
    departementId = uuid();
    vendorId = uuid();

    await dataSource.query(
      'INSERT INTO directions (id, title, abriviation) VALUES ($1, $2, $3)',
      [directionId, `Dir-${s}`, `D-${s}`],
    );
    await dataSource.query(
      'INSERT INTO departements (id, title, abriviation, "directionId") VALUES ($1, $2, $3, $4)',
      [departementId, `Dept-${s}`, `DP-${s}`, directionId],
    );
    await dataSource.query(
      `INSERT INTO vendors
         (id, num, company_name, nif, nrc, address, mobile_phone_number, home_phone_number, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        vendorId,
        `NUM-${s}`,
        `Co-${s}`,
        `NIF-${s}`,
        `NRC-${s}`,
        '1 St',
        '055',
        '021',
      ],
    );
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM vendors WHERE id = $1', [vendorId]);
    await dataSource.query('DELETE FROM departements WHERE id = $1', [
      departementId,
    ]);
    await dataSource.query('DELETE FROM directions WHERE id = $1', [
      directionId,
    ]);
    await module.close();
  });

  afterEach(async () => {
    if (agreementIds.length) {
      await dataSource.query(
        `DELETE FROM agreements WHERE id IN (${agreementIds
          .map((_, i) => `$${i + 1}`)
          .join(',')})`,
        [...agreementIds],
      );
      agreementIds.length = 0;
    }
  });

  function buildAgreement() {
    const s = uuid().replace(/-/g, '').slice(0, 8);
    return Agreement.create({
      id: uuid(),
      number: `AG-${s}`,
      type: AgreementType.CONTRACT,
      object: `Test object ${s}`,
      amount: 10000,
      expiration_date: new Date('2027-12-31'),
      signature_date: new Date('2024-01-01'),
      url: `https://example.com/${s}.pdf`,
      departementId,
      directionId,
      vendorId,
    });
  }

  // ── save ─────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('returns an Agreement aggregate, never a TypeORM entity', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);

      const result = await repo.save(agreement);

      expect(result).toBeInstanceOf(Agreement);
      expect(result).not.toBeInstanceOf(AgreementEntity);
      expect(typeof result.pullEvents).toBe('function');
    });

    it('persists all scalar fields and FK references', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);

      const result = await repo.save(agreement);

      expect(result.id).toBe(agreement.id);
      expect(result.number).toBe(agreement.number);
      expect(result.type).toBe(AgreementType.CONTRACT);
      expect(result.object).toBe(agreement.object);
      expect(result.amount).toBe(agreement.amount);
      expect(result.vendorId).toBe(vendorId);
      expect(result.directionId).toBe(directionId);
      expect(result.departementId).toBe(departementId);
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('loads an AgreementDetail with vendor, direction, and departement summaries', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      const result = await repo.findById(agreement.id, AgreementType.CONTRACT);

      expect(result).toBeInstanceOf(Agreement);
      expect(result).not.toBeInstanceOf(AgreementEntity);
      expect(result.id).toBe(agreement.id);
      // Relation summaries are plain objects, not TypeORM entities
      expect(result.vendor).not.toBeInstanceOf(VendorEntity);
      expect(result.vendor).not.toBeInstanceOf(VendorEntity);
      expect(result.vendor).toEqual({
        id: vendorId,
        company_name: expect.any(String),
      });
      expect(result.direction).toEqual({
        id: directionId,
        abriviation: expect.any(String),
      });
      expect(result.departement).toEqual({
        id: departementId,
        abriviation: expect.any(String),
      });
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findById(uuid(), AgreementType.CONTRACT)).toBeNull();
    });
  });

  // ── findByIdForExecution ──────────────────────────────────────────────────

  describe('findByIdForExecution', () => {
    it('returns a lean Agreement aggregate without relation data', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      const result = await repo.findByIdForExecution(agreement.id);

      expect(result).toBeInstanceOf(Agreement);
      expect(result).not.toBeInstanceOf(AgreementEntity);
      expect(result.id).toBe(agreement.id);
      expect(result.number).toBe(agreement.number);
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findByIdForExecution(uuid())).toBeNull();
    });
  });

  // ── findExpiringContracts ─────────────────────────────────────────────────

  describe('findExpiringContracts', () => {
    it('returns agreements whose execution_end_date is exactly N days from today', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      // Set execution_end_date to exactly 7 days from now via raw SQL
      await dataSource.query(
        "UPDATE agreements SET execution_end_date = CURRENT_DATE + INTERVAL '7 days' WHERE id = $1",
        [agreement.id],
      );

      const results = await repo.findExpiringContracts(7);
      const found = results.find((a) => a.id === agreement.id);

      expect(found).toBeDefined();
      expect(found).toBeInstanceOf(Agreement);
    });

    it('does not return agreements expiring on a different day', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      await dataSource.query(
        "UPDATE agreements SET execution_end_date = CURRENT_DATE + INTERVAL '14 days' WHERE id = $1",
        [agreement.id],
      );

      const results = await repo.findExpiringContracts(7);
      const found = results.find((a) => a.id === agreement.id);

      expect(found).toBeUndefined();
    });

    it('does not return agreements with no execution_end_date', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      const results = await repo.findExpiringContracts(0);
      const found = results.find((a) => a.id === agreement.id);

      expect(found).toBeUndefined();
    });
  });

  // ── findPaginated ─────────────────────────────────────────────────────────

  describe('findPaginated', () => {
    it('includes vendor summary on each returned row', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      const result = await repo.findPaginated(
        { agreementType: AgreementType.CONTRACT, offset: 0, limit: 50 } as any,
        'ADMIN' as any,
      );

      const row = result.data.find((a) => a.id === agreement.id);
      expect(row).toBeDefined();
      expect(row.vendor).toEqual({
        id: vendorId,
        company_name: expect.any(String),
      });
    });

    it('returns paginated totals and correct page size', async () => {
      const a1 = buildAgreement();
      const a2 = buildAgreement();
      agreementIds.push(a1.id, a2.id);
      await repo.save(a1);
      await repo.save(a2);

      const result = await repo.findPaginated(
        { agreementType: AgreementType.CONTRACT, offset: 0, limit: 1 } as any,
        'ADMIN' as any,
      );

      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.data).toHaveLength(1);
    });
  });

  // ── findOneByNumber ───────────────────────────────────────────────────────

  describe('findOneByNumber', () => {
    it('finds an agreement by its unique number', async () => {
      const agreement = buildAgreement();
      agreementIds.push(agreement.id);
      await repo.save(agreement);

      const result = await repo.findOneByNumber(agreement.number);

      expect(result).toBeInstanceOf(Agreement);
      expect(result).not.toBeInstanceOf(AgreementEntity);
      expect(result.id).toBe(agreement.id);
    });

    it('returns null for an unknown number', async () => {
      expect(await repo.findOneByNumber('NO-SUCH-NUMBER')).toBeNull();
    });
  });
});
