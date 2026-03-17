import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { DepartementController } from './controllers/departement.controller';
import { DirectionController } from './controllers/direction.controller';
import { DirectionRepository } from './direction.repository';
import { DIRECTION_REPOSITORY } from './domain/direction.repository';
import { DepartementService } from './services/departement.service';
import { DirectionService } from './services/direction.service';

@Module({
  imports: [
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
  exports: [DepartementService, DirectionService],
})
export class DirectionModule {}
