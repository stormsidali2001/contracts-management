import {Module} from '@nestjs/common';
import { DepartementController } from './controllers/departement.controller';
import { DirectionController } from './controllers/direction.controller';
import { DepartementService } from './services/departement.service';
import { DirectionService } from './services/direction.service';

@Module({
    providers:[DepartementService,DirectionService],
    controllers:[DepartementController,DirectionController]
})
export class DirectionModule{}