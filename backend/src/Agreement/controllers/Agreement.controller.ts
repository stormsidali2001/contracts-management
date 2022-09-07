import { Controller , Post , Body} from "@nestjs/common";
import { CreateAgreementDTO } from "../../core/dtos/agreement.dto";
import { AgreementService } from "../services/Agreement.service";

@Controller('Agreements')
export class AgreementController{
    constructor(
        private AgreementService:AgreementService
    ){}
    @Post("")
    async createAgreement(@Body() agreement:CreateAgreementDTO){
        return await this.AgreementService.createAgreement(agreement);
    }
}