import { Controller , Post , Body ,UseGuards} from "@nestjs/common";
import { RequiredRoles } from "src/auth/decorators/RequiredRoles.decorator";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { RoleGuard } from "src/auth/guards/Role.guard";
import { UserRole } from "src/core/types/UserRole.enum";
import { CreateAgreementDTO } from "../../core/dtos/agreement.dto";
import { AgreementService } from "../services/Agreement.service";

@Controller('Agreements')
export class AgreementController{
    constructor(
        private AgreementService:AgreementService
    ){}
    @RequiredRoles(UserRole.JURIDICAL,UserRole.ADMIN)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Post("")
    async createAgreement(@Body() agreement:CreateAgreementDTO){
        return await this.AgreementService.createAgreement(agreement);
    }
}