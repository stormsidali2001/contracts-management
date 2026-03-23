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
    type: 'mysql',
    host: process.env.MYSQL_DATABASE_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_DATABASE_PORT) || 3306,
    username: process.env.MYSQL_USERNAME ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE_NAME ?? 'contracts',
    entities: ALL_ENTITIES,
    synchronize: false,
  });
}
