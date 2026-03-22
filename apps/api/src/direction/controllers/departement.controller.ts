import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateDepartementDTO,
  UpdateDepartementDTO,
} from 'src/core/dtos/departement.dto';
import { DepartementService } from '../application/departement.service';
import { DepartementView } from '@contracts/types';
import { DepartementMapper } from 'src/core/mappers/departement.mapper';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('departements')
@Controller('departements')
export class DepartementController {
  constructor(private readonly departementService: DepartementService) {}

  @Post('')
  async createDepartement(@Body() departement: CreateDepartementDTO) {
    const result = await this.departementService.createDepartement(departement);
    return DepartementMapper.from(result);
  }

  @Put(':id')
  async updateDepartement(
    @Param('id') id: string,
    @Body() departement: UpdateDepartementDTO,
  ) {
    const result = await this.departementService.updateDepartement(id, departement);
    return DepartementMapper.from(result);
  }

  @Delete(':id')
  async deleteDepartement(@Param('id') id: string) {
    return await this.departementService.deleteDepartement(id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.departementService.findById(id);
    return result ? DepartementMapper.from(result) : null;
  }

  @Get('')
  async findAll(
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.departementService.findAll(offset, limit);
    return DepartementMapper.fromMany(result);
  }
}

