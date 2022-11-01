import { Controller , Post , Body ,UseGuards , Query , Get, Param, Patch} from "@nestjs/common";
import { CreateAgreementDTO, ExecuteAgreementDTO, FindAllAgreementsDTO } from "../../core/dtos/agreement.dto";
import { AgreementService } from "../services/Agreement.service";
import { ApiQuery, ApiTags} from '@nestjs/swagger';
import { AgreementEntity } from "src/core/entities/Agreement.entity";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
import { AgreementType } from "src/core/types/agreement-type.enum";
import { AgreementStatus } from "src/core/types/agreement-status.enum";
import { StatsParamsDTO } from "src/statistics/models/statsPramsDTO.interface";
import { CurrentUserId } from "src/auth/decorators/currentUserId.decorator";
@ApiTags('Agreements')
// @RequiredRoles(UserRole.JURIDICAL,UserRole.ADMIN)
// @UseGuards(JwtAccessTokenGuard,RoleGuard)
@Controller('Agreements')
export class AgreementController{
    constructor(
        private AgreementService:AgreementService
    ){}
   
    @Post("")
    async createAgreement(@Body() agreement:CreateAgreementDTO){
        return await this.AgreementService.createAgreement(agreement);
    }


    
    @Get(':id')
    async findById(@Param("id") id:string ,@Query("agreementType") agreementType:AgreementType){
        return await this.AgreementService.findById(id,agreementType)
    }
    @Get('')
    async findAll(
            @Query() params:FindAllAgreementsDTO,
            @CurrentUserId() userId:string
           

            )
            :Promise<PaginationResponse<AgreementEntity>>
            {
        return await  this.AgreementService.findAll(params,userId);
    }   

    @Patch('exec')
    async executeAgreement(@Body() execAg:ExecuteAgreementDTO){
        return await this.AgreementService.executeAgreement(execAg)
    }

  

}
