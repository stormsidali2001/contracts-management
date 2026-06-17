import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { DirectionModule } from 'src/direction/direction.module';
import { EventModule } from 'src/Event/Event.module';
import { UserModule } from 'src/user/user.module';
import { AgreementController } from './infrastructure/controllers/Agreement.controller';
import { AgreementFileController } from './infrastructure/controllers/AgreementFile.controller';
import { VendorController } from './infrastructure/controllers/Vendor.controller';
import { VendorImageController } from './infrastructure/controllers/VendorImage.controller';
import { AgreementRepository } from './infrastructure/persistence/agreement.repository';
import { VendorRepository } from './infrastructure/persistence/vendor.repository';
import { AgreementService } from './application/Agreement.service';
import { VendorService } from './application/vendor.service';
import { AGREEMENT_REPOSITORY } from './domain/persistence/agreement.repository';
import { VENDOR_REPOSITORY } from './domain/persistence/vendor.repository';
import { AgreementCreatedHandler } from './infrastructure/handlers/agreement-created.handler';
import { AgreementExecutedHandler } from './infrastructure/handlers/agreement-executed.handler';
import { VendorCreatedHandler } from './infrastructure/handlers/vendor-created.handler';
import { VendorUpdatedHandler } from './infrastructure/handlers/vendor-updated.handler';
import { VendorDeletedHandler } from './infrastructure/handlers/vendor-deleted.handler';
import { ContractExpiringHandler } from './infrastructure/handlers/contract-expiring.handler';
import { ContractExpiryService } from './application/contract-expiry.service';

const eventHandlers = [
  AgreementCreatedHandler,
  AgreementExecutedHandler,
  VendorCreatedHandler,
  VendorUpdatedHandler,
  VendorDeletedHandler,
  ContractExpiringHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      AgreementEntity,
      VendorEntity,
      DirectionEntity,
      DepartementEntity,
      VendorStatsEntity,
    ]),
    DirectionModule,
    EventModule,
    UserModule,
  ],
  providers: [
    { provide: AGREEMENT_REPOSITORY, useClass: AgreementRepository },
    { provide: VENDOR_REPOSITORY, useClass: VendorRepository },
    AgreementService,
    VendorService,
    ContractExpiryService,
    ...eventHandlers,
  ],
  exports: [AgreementService, VendorService],
  controllers: [
    AgreementController,
    VendorController,
    AgreementFileController,
    VendorImageController,
  ],
})
export class AgreementModule {}
