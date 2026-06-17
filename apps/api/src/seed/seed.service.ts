import { Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { EventBus } from '@nestjs/cqrs';
import { DirectionService } from 'src/direction/application/direction.service';
import { VendorService } from 'src/Agreement/application/vendor.service';
import { AgreementService } from 'src/Agreement/application/Agreement.service';
import { AuthService } from 'src/auth/application/auth.service';
import { UserRole } from 'src/core/types/UserRole.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { ContractExpiringEvent } from 'src/Agreement/domain/events/contract-expiring.event';

const FIXED_DIRECTIONS = [
  {
    title: 'direction generale',
    abriviation: 'DRG',
    departements: [
      { title: 'Secrétariat Général', abriviation: 'SG' },
      { title: 'Relations Publiques', abriviation: 'RP' },
      { title: 'Audit Interne', abriviation: 'AI' },
      { title: 'Communication', abriviation: 'COM' },
    ],
  },
  {
    title: 'direction de marketing',
    abriviation: 'DMK',
    departements: [
      { title: 'Marketing Digital', abriviation: 'MKD' },
      { title: 'Études de Marché', abriviation: 'EM' },
      { title: 'Communication Commerciale', abriviation: 'CC' },
    ],
  },
  {
    title: 'direction de finance',
    abriviation: 'DFN',
    departements: [
      { title: 'Comptabilité', abriviation: 'CPT' },
      { title: 'Trésorerie', abriviation: 'TRS' },
      { title: 'Contrôle de Gestion', abriviation: 'CG' },
      { title: 'Fiscalité', abriviation: 'FSC' },
    ],
  },
  {
    title: 'direction de production',
    abriviation: 'DPR',
    departements: [
      { title: 'Production', abriviation: 'PRD' },
      { title: 'Qualité', abriviation: 'QLT' },
      { title: 'Maintenance', abriviation: 'MNT' },
      { title: 'Logistique', abriviation: 'LOG' },
    ],
  },
];

const FIXED_ACCOUNTS = [
  {
    username: 'storm.sidali',
    firstName: 'sidali',
    lastName: 'assoul',
    email: 'assoulsidali@gmail.com',
    role: UserRole.EMPLOYEE,
    password: '123456',
    needsDirection: true,
  },
  {
    username: 'admin.admin',
    firstName: 'admin',
    lastName: 'admin',
    email: 'admin@gmail.com',
    role: UserRole.ADMIN,
    password: '123456',
    needsDirection: false,
  },
  {
    username: 'juridical.adala',
    firstName: 'juridical',
    lastName: 'adala',
    email: 'juridical@gmail.com',
    role: UserRole.JURIDICAL,
    password: '123456',
    needsDirection: false,
  },
  {
    username: 'admin1.admin1',
    firstName: 'admin1',
    lastName: 'admin1',
    email: 'admin1@gmail.com',
    role: UserRole.ADMIN,
    password: '123456',
    needsDirection: false,
  },
];

const CONTRACT_OBJECTS = [
  'Fourniture et installation de matériel informatique',
  'Prestation de services de maintenance préventive et corrective',
  'Acquisition de logiciels de gestion et licences associées',
  "Travaux de rénovation et d'aménagement des locaux",
  "Services de nettoyage et d'entretien des bâtiments",
  'Fourniture de consommables et fournitures de bureau',
  'Prestation de services de gardiennage et sécurité',
  'Acquisition de véhicules de service et utilitaires',
  'Services de formation et de développement des compétences',
  'Fourniture et pose de mobilier de bureau',
  'Prestation de services de transport et logistique',
  "Acquisition d'équipements de télécommunications",
  "Services de consultation et d'assistance technique",
  "Fourniture d'énergie électrique et gestion des utilités",
  "Prestation de services d'impression et reprographie",
  "Acquisition d'équipements de climatisation et ventilation",
  'Services de restauration et traiteur pour événements',
  'Fourniture de matériaux de construction et travaux annexes',
  "Prestation de services d'audit et de contrôle qualité",
  "Acquisition de systèmes de vidéosurveillance et contrôle d'accès",
];

const randomChar = () => {
  const code = Math.floor(Math.random() * 26) + 65;
  return Math.random() > 0.5
    ? String.fromCharCode(code)
    : String.fromCharCode(code).toLowerCase();
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const addMonths = (d: Date, months: number): Date => {
  const date = new Date(d);
  const day = date.getDate();
  date.setMonth(date.getMonth() + months);
  if (day !== date.getDate()) date.setDate(0);
  return date;
};

const fmt = (d: Date) => d.toISOString().replace(/T.*/g, '');

const buildDates = (statusSlot: number, now: Date) => {
  let signatureDate: Date;
  let expirationDate: Date;
  let executionDates: { start: Date; end: Date } | null = null;

  switch (statusSlot % 5) {
    case 0:
      signatureDate = now;
      expirationDate = addMonths(now, 6);
      break;
    case 1:
      signatureDate = addMonths(now, -12);
      expirationDate = addMonths(now, 12);
      executionDates = { start: addMonths(now, -6), end: addMonths(now, 6) };
      break;
    case 2:
      signatureDate = addMonths(now, -24);
      expirationDate = addMonths(now, -6);
      executionDates = { start: addMonths(now, -3), end: addMonths(now, 6) };
      break;
    case 3:
      signatureDate = addMonths(now, -24);
      expirationDate = addMonths(now, 12);
      executionDates = { start: addMonths(now, -12), end: addMonths(now, -6) };
      break;
    default:
      signatureDate = addMonths(now, -24);
      expirationDate = addMonths(now, -12);
      executionDates = { start: addMonths(now, -8), end: addMonths(now, -3) };
      break;
  }
  return { signatureDate, expirationDate, executionDates };
};

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly directionService: DirectionService,
    private readonly vendorService: VendorService,
    private readonly agreementService: AgreementService,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

  async triggerExpiry(agreementId: string, daysUntilExpiry = 30): Promise<void> {
    const agreement = await this.agreementService.findById(agreementId);
    if (!agreement) {
      const convention = await this.agreementService.findById(
        agreementId,
        AgreementType.CONVENSION,
      );
      if (!convention) {
        this.logger.error(`Agreement with ID ${agreementId} not found.`);
        return;
      }
      this.#publishExpiryEvent(convention, daysUntilExpiry);
    } else {
      this.#publishExpiryEvent(agreement, daysUntilExpiry);
    }
  }

  #publishExpiryEvent(agreement: any, daysUntilExpiry: number) {
    this.eventBus.publish(
      new ContractExpiringEvent(
        agreement.id,
        agreement.number,
        daysUntilExpiry,
        agreement.execution_end_date || agreement.expiration_date,
        agreement.departementId,
        agreement.directionId,
      ),
    );
    this.logger.log(
      `Triggered expiry alert for agreement ${agreement.number} (${daysUntilExpiry} days)`,
    );
  }

  async seedDirections(): Promise<void> {
    for (const dir of FIXED_DIRECTIONS) {
      try {
        await this.directionService.createDirection(dir);
        this.logger.log(`Created direction: ${dir.title}`);
      } catch (err: any) {
        this.logger.warn(`Skipped direction "${dir.title}": ${err.message}`);
      }
    }
  }

  async seedVendors(count: number): Promise<void> {
    const directions = await this.directionService.findAll(0, 100);
    const slots = directions.flatMap((d) =>
      (d.departements ?? []).map((dp: any) => ({
        directionId: d.id,
        departementId: dp.id,
      })),
    );
    if (slots.length === 0) {
      this.logger.error('No directions found. Run seed:directions first.');
      return;
    }

    let created = 0;
    let skipped = 0;
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const s = uuid().replace(/-/g, '').slice(0, 10);
      const nif =
        randomChar() +
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join(
          '',
        ) +
        randomChar() +
        s;
      try {
        const vendor = await this.vendorService.createVendor({
          nif,
          company_name: faker.company.name() + ' ' + s,
          nrc: Array.from({ length: 6 }, randomChar).join('') + s,
          num: Array.from({ length: 6 }, randomChar).join('') + s,
          address:
            faker.address.country() +
            ' ' +
            faker.address.state() +
            ' ' +
            faker.address.city(),
          mobile_phone_number: faker.phone.number('06########'),
          home_phone_number: faker.phone.number('03########'),
        } as any);
        created++;

        for (let j = 0; j < 10; j++) {
          await this.#createOneAgreement(
            vendor.id,
            AgreementType.CONTRACT,
            j,
            slots,
            now,
          );
          await this.#createOneAgreement(
            vendor.id,
            AgreementType.CONVENSION,
            j,
            slots,
            now,
          );
        }

        this.logger.log(
          `Created vendor ${created}/${count} with 10 contracts + 10 conventions`,
        );
      } catch (err: any) {
        skipped++;
        this.logger.warn(`Skipped vendor: ${err.message}`);
      }
    }

    if (skipped > 0) {
      this.logger.log(`Seeded vendors: ${created} created, ${skipped} skipped`);
    }
  }

  async seedUsers(count: number): Promise<void> {
    const directions = await this.directionService.findAll(0, 100);
    const slots = directions.flatMap((d) =>
      (d.departements ?? []).map((dp: any) => ({
        directionId: d.id,
        departementId: dp.id,
      })),
    );
    if (slots.length === 0) {
      this.logger.error(
        'No directions/departments found. Run seed:directions first.',
      );
      return;
    }

    const roles = [UserRole.JURIDICAL, UserRole.EMPLOYEE, UserRole.ADMIN];
    const users = Array.from({ length: count }, () => {
      const slot = pick(slots);
      return {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        role: pick(roles),
        departementId: slot.departementId,
        directionId: slot.directionId,
        password: '123456',
      } as any;
    });

    // Hash the shared password once, then register all users in parallel batches.
    // This avoids N serial bcrypt calls (each ~300 ms at 12 rounds).
    const { created, skipped } = await this.authService.registerBatch(
      users,
      '123456',
    );
    this.logger.log(`Seeded users: ${created} created, ${skipped} skipped`);
  }

  async seedAgreements(count: number): Promise<void> {
    const [directions, vendorsPage] = await Promise.all([
      this.directionService.findAll(0, 100),
      this.vendorService.findAll(0, 1000),
    ]);

    const vendorIds = vendorsPage.data.map((v: any) => v.id);
    const slots = directions.flatMap((d) =>
      (d.departements ?? []).map((dp: any) => ({
        directionId: d.id,
        departementId: dp.id,
      })),
    );

    if (slots.length === 0 || vendorIds.length === 0) {
      this.logger.error(
        'Need directions and vendors first. Run seed:directions and seed:vendors.',
      );
      return;
    }

    let created = 0;
    let skipped = 0;
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const type =
        Math.random() > 0.5 ? AgreementType.CONTRACT : AgreementType.CONVENSION;
      try {
        await this.#createOneAgreement(pick(vendorIds), type, i, slots, now);
        created++;
        this.logger.log(`Created agreement ${created}/${count}`);
      } catch (err: any) {
        skipped++;
        this.logger.warn(`Skipped agreement: ${err.message}`);
      }
    }

    this.logger.log(
      `Seeded agreements: ${created} created, ${skipped} skipped`,
    );
  }

  async #createOneAgreement(
    vendorId: string,
    type: AgreementType,
    statusSlot: number,
    slots: Array<{ directionId: string; departementId: string }>,
    now: Date,
  ): Promise<void> {
    const slot = pick(slots);
    const { signatureDate, expirationDate, executionDates } = buildDates(
      statusSlot,
      now,
    );
    const agreement = await this.agreementService.createAgreement({
      number:
        Array.from({ length: 6 }, randomChar).join('') +
        uuid().replace(/-/g, '').slice(0, 8),
      type,
      amount: Math.floor(Math.random() * 1000 + 200),
      signature_date: fmt(signatureDate) as any,
      expiration_date: fmt(expirationDate) as any,
      url: '2ad66aba-d2b1-4c63-9b46-fd4b6be94388.pdf',
      object: pick(CONTRACT_OBJECTS),
      directionId: slot.directionId,
      departementId: slot.departementId,
      vendorId,
    });
    if (executionDates) {
      await this.agreementService.executeAgreement({
        agreementId: agreement.id,
        execution_start_date: fmt(executionDates.start) as any,
        execution_end_date: fmt(executionDates.end) as any,
        observation: '',
      });
    }
  }

  async seedAccounts(): Promise<void> {
    const directions = await this.directionService.findAll(0, 100);
    const slots = directions.flatMap((d) =>
      (d.departements ?? []).map((dp: any) => ({
        directionId: d.id,
        departementId: dp.id,
      })),
    );
    const slot = slots.length > 0 ? pick(slots) : null;

    for (const account of FIXED_ACCOUNTS) {
      const { needsDirection, ...payload } = account;
      const extra = needsDirection && slot ? slot : {};
      try {
        await this.authService.register({ ...payload, ...extra } as any);
        this.logger.log(`Created account: ${account.username}`);
      } catch (err: any) {
        this.logger.warn(`Skipped "${account.username}": ${err.message}`);
      }
    }
  }
}
