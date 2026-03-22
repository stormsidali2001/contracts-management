import { Controller, Post, Get, Body, Param, UseGuards, Query, Patch, Delete } from '@nestjs/common';
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { UserRole } from 'src/core/types/UserRole.enum';
import { VendorService } from '../application/vendor.service';
import { ApiTags } from '@nestjs/swagger';
import { VendorView, VendorStatsView } from '@contracts/types';
import { VendorMapper } from 'src/core/mappers/vendor.mapper';
import { VendorStatsMapper } from 'src/core/mappers/vendor-stats.mapper';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';

@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Post('')
  async createVendor(@Body() vendor: CreateVendorDTO) {
    const result = await this.vendorService.createVendor(vendor);
    return VendorMapper.from(result);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('stats')
  async getVendorStats(@Query() params: StatsParamsDTO) {
    const result = await this.vendorService.getVendorsStats(params);
    return VendorStatsMapper.fromMany(result);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const result = await this.vendorService.findByIdWithRelations(id);
    return result ? VendorMapper.from(result) : null;
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async findAll(
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
    @Query('orderBy') orderBy: string = undefined,
    @Query("searchQuery") searchQuery: string = undefined,
  ) {
    const result = await this.vendorService.findAll(offset, limit, orderBy, searchQuery);
    return { total: result.total, data: VendorMapper.fromMany(result.data) };
  }

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Patch(':id')
  async updateVendor(@Param('id') id: string, @Body() newVendor: UpdateVendorDTO) {
    const result = await this.vendorService.updateVendor(id, newVendor);
    return VendorMapper.from(result);
  }

  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Delete(':id')
  async deleteVendor(@Param('id') vendorId: string) {
    return this.vendorService.deleteVendor(vendorId);
  }

  //testing route
  @Post('/test')
  async createVendorTest(@Body() vendor: CreateVendorDTO) {
    const result = await this.vendorService.createVendor(vendor);
    return VendorMapper.from(result);
  }
}
