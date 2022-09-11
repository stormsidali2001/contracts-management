import {Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { DirectionModule } from 'src/direction/direction.module';
import { DirectionService } from 'src/direction/services/direction.service';
import { AgreementController } from './controllers/Agreement.controller';
import { VendorController } from './controllers/Vendor.controller';
import { AgreementService } from './services/Agreement.service';
import { VendorService } from './services/vendor.service';

@Module({
    imports:[TypeOrmModule.forFeature([AgreementEntity,VendorEntity,DirectionEntity,DepartementEntity]),AuthModule,DirectionModule],
    providers:[AgreementService,VendorService],
    controllers:[AgreementController,VendorController]
})
export class AgreementModule{}