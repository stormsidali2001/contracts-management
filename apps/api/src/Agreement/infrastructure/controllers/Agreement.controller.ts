import {
  Controller,
  Post,
  Body,
  UseGuards,
  Query,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  CreateAgreementDTO,
  ExecuteAgreementDTO,
  FindAllAgreementsDTO,
} from '../../../core/dtos/agreement.dto';
import { AgreementService } from '../../application/Agreement.service';
import { ApiTags } from '@nestjs/swagger';
import { AgreementPresenter } from 'src/Agreement/infrastructure/agreement.presenter';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { CurrentUser } from 'src/auth/infrastructure/decorators/currentUser.decorator';
import { JwtPayload } from 'src/auth/infrastructure/types/JwtPayload.interface';
import { JwtAccessTokenGuard } from 'src/auth/infrastructure/guards/jwt-access-token.guard';
import { RequiredRoles } from 'src/auth/infrastructure/decorators/RequiredRoles.decorator';
import { UserRole } from 'src/core/types/UserRole.enum';
import { RoleGuard } from 'src/auth/infrastructure/guards/Role.guard';

@ApiTags('Agreements')
@Controller('Agreements')
export class AgreementController {
  constructor(private readonly AgreementService: AgreementService) {}

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Post('')
  async createAgreement(@Body() agreement: CreateAgreementDTO) {
    const result = await this.AgreementService.createAgreement(agreement);
    return AgreementPresenter.from(result);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('agreementType') agreementType: AgreementType,
  ) {
    const result = await this.AgreementService.findById(id, agreementType);
    return result ? AgreementPresenter.from(result) : null;
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async findAll(
    @Query() params: FindAllAgreementsDTO,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.AgreementService.findAll(
      params,
      user.role,
      user.departementId,
      user.directionId,
    );
    return {
      total: result.total,
      data: AgreementPresenter.fromMany(result.data),
    };
  }

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Patch('exec')
  async executeAgreement(@Body() execAg: ExecuteAgreementDTO) {
    const result = await this.AgreementService.executeAgreement(execAg);
    return AgreementPresenter.from(result);
  }

  //testing routes
  @UseGuards(JwtAccessTokenGuard)
  @Post('/test')
  async createAgreementTest(@Body() agreement: CreateAgreementDTO) {
    const result = await this.AgreementService.createAgreement(agreement);
    return AgreementPresenter.from(result);
  }
}
