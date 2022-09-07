import { Controller , Post , Body} from "@nestjs/common";
import { CreateAgreementDTO } from "src/core/dtos/agreement.dto";

@Controller('Agreements')
export class AgreementController{
    @Post("")
    async createAgreement(@Body() agreement:CreateAgreementDTO){
        return await this.createAgreement(agreement);
    }
}