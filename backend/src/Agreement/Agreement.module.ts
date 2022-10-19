import {Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { AgreementExecJobsEntity } from 'src/core/entities/agreementExecJobs';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { DirectionModule } from 'src/direction/direction.module';
import { DirectionService } from 'src/direction/services/direction.service';
import { AgreementController } from './controllers/Agreement.controller';
import { AgreementFileController } from './controllers/AgreementFile.controller';
import { VendorController } from './controllers/Vendor.controller';
import { AgreementService } from './services/Agreement.service';
import { VendorService } from './services/vendor.service';

@Module({
    imports:[TypeOrmModule.forFeature([AgreementEntity,VendorEntity,DirectionEntity,DepartementEntity,VendorStatsEntity,AgreementExecJobsEntity]),AuthModule,DirectionModule],
    providers:[AgreementService,VendorService],
    exports:[AgreementService,VendorService],
    controllers:[AgreementController,VendorController,AgreementFileController]
})
export class AgreementModule{}