import { Controller , Post , Body ,UseGuards , Query , Get} from "@nestjs/common";
import { RequiredRoles } from "src/auth/decorators/RequiredRoles.decorator";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { RoleGuard } from "src/auth/guards/Role.guard";
import { CreateAgreementDTO } from "../../core/dtos/agreement.dto";
import { AgreementService } from "../services/Agreement.service";
import {ApiProperty, ApiQuery, ApiTags} from '@nestjs/swagger';
import { AgreementEntity } from "src/core/entities/Agreement.entity";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
import { AgreementType } from "src/core/types/agreement-type.enum";
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

    @ApiQuery({
        enum:AgreementType,
        name:'agreementType',
        enumName:'agreementType'
    })
    @Get('')
    async findAll(@Query('offset') offset:number = 0 ,@Query('limit') limit:number = 10 ,@Query('orderBy') orderBy:string  = undefined,@Query('agreementType') agreementType:AgreementType ,@Query("searchQuery") searchQuery:string):Promise<PaginationResponse<AgreementEntity>>{
        return await  this.AgreementService.findAll(offset,limit,orderBy,agreementType,searchQuery);
    }   
}