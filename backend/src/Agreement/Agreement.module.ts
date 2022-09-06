import {Module} from '@nestjs/common';
import { AgreementController } from './Agreement.controller';
import { AgreementService } from './Agreement.service';

@Module({
    providers:[AgreementService],
    controllers:[AgreementController]
})
export class AgreementModule{}