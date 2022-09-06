import {Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { DepartementController } from './controllers/departement.controller';
import { DirectionController } from './controllers/direction.controller';
import { DepartementService } from './services/departement.service';
import { DirectionService } from './services/direction.service';

@Module({
    imports:[TypeOrmModule.forFeature([DepartementEntity,DirectionEntity,AgreementEntity,VendorEntity])],
    providers:[DepartementService,DirectionService],
    controllers:[DepartementController,DirectionController]
})

export class DirectionModule{}