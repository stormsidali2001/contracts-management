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
import { AgreementController } from './controllers/Agreement.controller';
import { AgreementFileController } from './controllers/AgreementFile.controller';
import { VendorController } from './controllers/Vendor.controller';
import { AgreementRepository } from './agreement.repository';
import { VendorRepository } from './vendor.repository';
import { AgreementService } from './services/Agreement.service';
import { VendorService } from './services/vendor.service';
import { AGREEMENT_REPOSITORY } from './domain/agreement.repository';
import { VENDOR_REPOSITORY } from './domain/vendor.repository';
import { AgreementCreatedHandler } from './handlers/agreement-created.handler';
import { AgreementExecutedHandler } from './handlers/agreement-executed.handler';
import { VendorCreatedHandler } from './handlers/vendor-created.handler';
import { VendorUpdatedHandler } from './handlers/vendor-updated.handler';
import { VendorDeletedHandler } from './handlers/vendor-deleted.handler';

const eventHandlers = [
  AgreementCreatedHandler,
  AgreementExecutedHandler,
  VendorCreatedHandler,
  VendorUpdatedHandler,
  VendorDeletedHandler,
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
    ...eventHandlers,
  ],
  exports: [AgreementService, VendorService, AGREEMENT_REPOSITORY],
  controllers: [AgreementController, VendorController, AgreementFileController],
})
export class AgreementModule {}
