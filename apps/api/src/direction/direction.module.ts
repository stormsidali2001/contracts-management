import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { DepartementController } from './infrastructure/controllers/departement.controller';
import { DirectionController } from './infrastructure/controllers/direction.controller';
import { DirectionRepository } from './infrastructure/persistence/direction.repository';
import { DIRECTION_REPOSITORY } from './domain/persistence/direction.repository';
import { DepartementService } from './application/departement.service';
import { DirectionService } from './application/direction.service';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      DepartementEntity,
      DirectionEntity,
      AgreementEntity,
      VendorEntity,
    ]),
  ],
  controllers: [DepartementController, DirectionController],
  providers: [
    { provide: DIRECTION_REPOSITORY, useClass: DirectionRepository },
    DepartementService,
    DirectionService,
  ],
  exports: [DirectionService],
})
export class DirectionModule {}
