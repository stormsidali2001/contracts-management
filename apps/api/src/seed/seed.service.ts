import { Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { DirectionService } from 'src/direction/application/direction.service';
import { VendorService } from 'src/Agreement/application/vendor.service';
import { AgreementService } from 'src/Agreement/application/Agreement.service';
import { AuthService } from 'src/auth/application/auth.service';
import { UserRole } from 'src/core/types/UserRole.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';

const FIXED_DIRECTIONS = [
  { title: 'direction generale', abriviation: 'DRG' },
  { title: 'direction de marketing', abriviation: 'DMK' },
  { title: 'direction de finance', abriviation: 'DFN' },
  { title: 'direction de production', abriviation: 'DPR' },
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

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly directionService: DirectionService,
    private readonly vendorService: VendorService,
    private readonly agreementService: AgreementService,
    private readonly authService: AuthService,
  ) {}

  async seedDirections(): Promise<void> {
    for (const dir of FIXED_DIRECTIONS) {
      const deptCount = Math.floor(Math.random() * 5) + 1;
      const departements = Array.from({ length: deptCount }, (_, i) => ({
        title: `departement ${i + 1}`,
        abriviation: `DP${i + 1}`,
      }));
      try {
        await this.directionService.createDirection({ ...dir, departements });
        this.logger.log(`Created direction: ${dir.title}`);
      } catch (err: any) {
        this.logger.warn(`Skipped direction "${dir.title}": ${err.message}`);
      }
    }
  }

  async seedVendors(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const nif =
        randomChar() +
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join(
          '',
        ) +
        randomChar();
      try {
        await this.vendorService.createVendor({
          nif,
          company_name: faker.company.name(),
          nrc: Array.from({ length: 10 }, randomChar).join(''),
          num: Array.from({ length: 10 }, randomChar).join(''),
          address:
            faker.address.country() +
            ' ' +
            faker.address.state() +
            ' ' +
            faker.address.city(),
          mobile_phone_number: faker.phone.number('06########'),
          home_phone_number: faker.phone.number('03########'),
        } as any);
        this.logger.log(`Created vendor ${i + 1}/${count}`);
      } catch (err: any) {
        this.logger.warn(`Skipped vendor: ${err.message}`);
      }
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
    for (let i = 0; i < count; i++) {
      const slot = pick(slots);
      try {
        await this.authService.register({
          username: faker.internet.userName(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          role: pick(roles),
          departementId: slot.departementId,
          directionId: slot.directionId,
          password: '123456',
        } as any);
        this.logger.log(`Created user ${i + 1}/${count}`);
      } catch (err: any) {
        this.logger.warn(`Skipped user: ${err.message}`);
      }
    }
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

    for (let i = 0; i < count; i++) {
      const slot = pick(slots);
      const now = new Date();
      try {
        await this.agreementService.createAgreement({
          number: Array.from({ length: 10 }, randomChar).join(''),
          type:
            Math.random() > 0.5
              ? AgreementType.CONTRACT
              : AgreementType.CONVENSION,
          amount: Math.floor(Math.random() * 1000 + 200),
          signature_date: fmt(now) as any,
          expiration_date: fmt(addMonths(now, 2)) as any,
          status: AgreementStatus.NOT_EXECUTED,
          url: '2ad66aba-d2b1-4c63-9b46-fd4b6be94388.pdf',
          object: "un champ reservee pour l'object",
          directionId: slot.directionId,
          departementId: slot.departementId,
          vendorId: pick(vendorIds),
        });
        this.logger.log(`Created agreement ${i + 1}/${count}`);
      } catch (err: any) {
        this.logger.warn(`Skipped agreement: ${err.message}`);
      }
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
