import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  ParseIntPipe,
  Delete,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { DirectionView } from '@contracts/types';
import { DirectionPresenter } from 'src/direction/infrastructure/direction.presenter';
import { DirectionService } from '../../application/direction.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from 'src/auth/infrastructure/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/infrastructure/guards/Role.guard';
import { RequiredRoles } from 'src/auth/infrastructure/decorators/RequiredRoles.decorator';
import { UserRole } from 'src/core/types/UserRole.enum';

@ApiTags('directions')
@Controller('directions')
export class DirectionController {
  constructor(private readonly directionService: DirectionService) {}

  @RequiredRoles(UserRole.ADMIN)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Post('')
  async createDirection(@Body() direction: CreateDirectionDTO) {
    const result = await this.directionService.createDirection(direction);
    return DirectionPresenter.from(result);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ): Promise<DirectionView[]> {
    const result = await this.directionService.findAll(offset, limit);
    return DirectionPresenter.fromMany(result);
  }

  @RequiredRoles(UserRole.ADMIN)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Delete(':id')
  async deleteDirection(@Param('id') id: string): Promise<string> {
    return await this.directionService.deleteDirection(id);
  }

  @RequiredRoles(UserRole.ADMIN)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Put(':id')
  async updateDirection(
    @Param('id') id: string,
    @Body() direction: updateDirectionDTO,
  ): Promise<DirectionView> {
    const result = await this.directionService.updateDirection(id, direction);
    return DirectionPresenter.from(result);
  }

  /**Testing routes */
  @UseGuards(JwtAccessTokenGuard)
  @Post('/test')
  async createDirectionTest(@Body() direction: CreateDirectionDTO) {
    console.log('...........................', JSON.stringify(direction));
    const result = await this.directionService.createDirection(direction);
    return DirectionPresenter.from(result);
  }
}
