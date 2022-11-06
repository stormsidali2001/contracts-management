import {forwardRef, Logger, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { AuthModule } from '../auth/auth.module';
import { DepartementController } from './controllers/departement.controller';
import { DirectionController } from './controllers/direction.controller';
import { DepartementService } from './services/departement.service';
import { DirectionService } from './services/direction.service';
@Module({
    imports:[forwardRef(() => AuthModule),TypeOrmModule.forFeature([DepartementEntity,DirectionEntity,AgreementEntity,VendorEntity])],
    controllers:[DepartementController,DirectionController],
    providers:[DepartementService,DirectionService],
    exports:[DepartementService,DirectionService]
})

export class DirectionModule{}