import { Controller, Post, Body, UseGuards, Query, Get, Param, Patch } from "@nestjs/common";
import { CreateAgreementDTO, ExecuteAgreementDTO, FindAllAgreementsDTO } from "../../core/dtos/agreement.dto";
import { AgreementService } from "../application/Agreement.service";
import { ApiTags } from '@nestjs/swagger';
import { AgreementView } from '@contracts/types';
import { AgreementMapper } from 'src/core/mappers/agreement.mapper';
import { AgreementType } from "src/core/types/agreement-type.enum";
import { CurrentUserId } from "src/auth/decorators/currentUserId.decorator";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { RequiredRoles } from "src/auth/decorators/RequiredRoles.decorator";
import { UserRole } from "src/core/types/UserRole.enum";
import { RoleGuard } from "src/auth/guards/Role.guard";

@ApiTags('Agreements')
@Controller('Agreements')
export class AgreementController {
  constructor(private AgreementService: AgreementService) {}

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Post("")
  async createAgreement(@Body() agreement: CreateAgreementDTO) {
    const result = await this.AgreementService.createAgreement(agreement);
    return AgreementMapper.from(result);
  }

  @Get(':id')
  async findById(@Param("id") id: string, @Query("agreementType") agreementType: AgreementType) {
    const result = await this.AgreementService.findById(id, agreementType);
    return result ? AgreementMapper.from(result) : null;
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async findAll(
    @Query() params: FindAllAgreementsDTO,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.AgreementService.findAll(params, userId);
    return { total: result.total, data: AgreementMapper.fromMany(result.data) };
  }

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Patch('exec')
  async executeAgreement(@Body() execAg: ExecuteAgreementDTO) {
    const result = await this.AgreementService.executeAgreement(execAg);
    return AgreementMapper.from(result);
  }

  //testing routes
  @Post("/test")
  async createAgreementTest(@Body() agreement: CreateAgreementDTO) {
    const result = await this.AgreementService.createAgreement(agreement);
    return AgreementMapper.from(result);
  }
}
