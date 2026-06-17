import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { CronJobsEntity } from 'src/core/entities/cronJobs.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { EventEntity } from 'src/core/entities/Event.entity';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserEntity } from 'src/core/entities/User.entity';
import { UserCredentialsEntity } from 'src/core/entities/UserCredentials.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';

// All TypeORM entities in the project — required so TypeORM can resolve every
// relation cross-reference when building entity metadata.
export const ALL_ENTITIES = [
  AgreementEntity,
  CronJobsEntity,
  DepartementEntity,
  DirectionEntity,
  EventEntity,
  NotificationEntity,
  PasswordTokenEntity,
  UserEntity,
  UserCredentialsEntity,
  VendorEntity,
  VendorStatsEntity,
];

export function typeOrmTestingModule() {
  return TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_TEST_HOST ?? process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_TEST_PORT ?? process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME ?? 'user1',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_TEST_NAME ?? 'contracts_management_test',
    entities: ALL_ENTITIES,
    synchronize: true,
  });
}
