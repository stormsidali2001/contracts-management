import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { typeOrmTestingModule } from 'src/test-utils/typeorm-testing';
import { DirectionRepository } from './direction.repository';
import { AgreementRepository } from 'src/Agreement/infrastructure/persistence/agreement.repository';
import { VendorRepository } from 'src/Agreement/infrastructure/persistence/vendor.repository';
import { AGREEMENT_REPOSITORY } from 'src/Agreement/domain/persistence/agreement.repository';
import { VENDOR_REPOSITORY } from 'src/Agreement/domain/persistence/vendor.repository';
import { DIRECTION_REPOSITORY } from 'src/direction/domain/persistence/direction.repository';
import { AgreementService } from 'src/Agreement/application/Agreement.service';
import { VendorService } from 'src/Agreement/application/vendor.service';
import { DirectionService } from 'src/direction/application/direction.service';

describe('DirectionRepository.getTopDirections (service-level integration)', () => {
  let module: TestingModule;
  let directionRepo: DirectionRepository;
  let directionService: DirectionService;
  let vendorService: VendorService;
  let agreementService: AgreementService;
  let dataSource: DataSource;

  const directionIds: string[] = [];
  const vendorIds: string[] = [];
  const agreementIds: string[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        typeOrmTestingModule(),
        CqrsModule,
        TypeOrmModule.forFeature([
          DirectionEntity,
          DepartementEntity,
          AgreementEntity,
          VendorEntity,
          VendorStatsEntity,
        ]),
      ],
      providers: [
        DirectionRepository,
        AgreementRepository,
        VendorRepository,
        { provide: DIRECTION_REPOSITORY, useClass: DirectionRepository },
        { provide: AGREEMENT_REPOSITORY, useClass: AgreementRepository },
        { provide: VENDOR_REPOSITORY, useClass: VendorRepository },
        DirectionService,
        VendorService,
        AgreementService,
      ],
    }).compile();

    directionRepo = module.get(DirectionRepository);
    directionService = module.get(DirectionService);
    vendorService = module.get(VendorService);
    agreementService = module.get(AgreementService);
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    if (agreementIds.length) {
      await dataSource.query(
        `DELETE FROM agreements WHERE id IN (${agreementIds
          .map((_, i) => `$${i + 1}`)
          .join(',')})`,
        agreementIds,
      );
    }
    if (vendorIds.length) {
      await dataSource.query(
        `DELETE FROM vendors WHERE id IN (${vendorIds
          .map((_, i) => `$${i + 1}`)
          .join(',')})`,
        vendorIds,
      );
    }
    if (directionIds.length) {
      const ph = directionIds.map((_, i) => `$${i + 1}`).join(',');
      await dataSource.query(
        `DELETE FROM departements WHERE "directionId" IN (${ph})`,
        directionIds,
      );
      await dataSource.query(
        `DELETE FROM directions WHERE id IN (${ph})`,
        directionIds,
      );
    }
    await module.close();
  });

  it('orders directions by agreement count descending', async () => {
    const s1 = uuid().replace(/-/g, '').slice(0, 8);
    const s2 = uuid().replace(/-/g, '').slice(0, 8);

    const dir1 = await directionService.createDirection({
      title: `Direction-${s1}`,
      abriviation: `D1${s1.slice(0, 4)}`,
      departements: [
        { title: `Dept-${s1}`, abriviation: `DP${s1.slice(0, 4)}` },
      ],
    });
    directionIds.push(dir1.id);

    const dir2 = await directionService.createDirection({
      title: `Direction-${s2}`,
      abriviation: `D2${s2.slice(0, 4)}`,
      departements: [
        { title: `Dept-${s2}`, abriviation: `DP${s2.slice(0, 4)}` },
      ],
    });
    directionIds.push(dir2.id);

    const sv = uuid().replace(/-/g, '').slice(0, 8);
    const vendor = await vendorService.createVendor({
      nif: `NIF${sv}`,
      company_name: `Co ${sv}`,
      nrc: `NRC${sv}`,
      num: `NUM${sv}`,
      address: '1 Test St',
      mobile_phone_number: '0551111111',
      home_phone_number: '0211111111',
    } as any);
    vendorIds.push(vendor.id);

    const dept1Id = dir1.departements[0].id;
    const dept2Id = dir2.departements[0].id;

    const baseAgreement = {
      object: 'Test object',
      amount: 1000,
      signature_date: new Date('2025-01-01') as any,
      expiration_date: new Date('2030-01-01') as any,
      url: 'test.pdf',
      vendorId: vendor.id,
    };

    for (let i = 0; i < 3; i++) {
      const ag = await agreementService.createAgreement({
        ...baseAgreement,
        number: uuid().replace(/-/g, '').slice(0, 10),
        directionId: dir1.id,
        departementId: dept1Id,
      });
      agreementIds.push(ag.id);
    }

    const ag = await agreementService.createAgreement({
      ...baseAgreement,
      number: uuid().replace(/-/g, '').slice(0, 10),
      directionId: dir2.id,
      departementId: dept2Id,
    });
    agreementIds.push(ag.id);

    const results = await directionRepo.getTopDirections();

    const ids = results.map((d) => d.id);
    expect(ids.indexOf(dir1.id)).toBeLessThan(ids.indexOf(dir2.id));
  });

  it('returns at most 5 directions', async () => {
    const results = await directionRepo.getTopDirections();
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
