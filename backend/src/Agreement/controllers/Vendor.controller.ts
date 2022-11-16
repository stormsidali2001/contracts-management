import {Controller ,Post ,Get , Body , Param, Put,UseGuards , Query, Logger, Patch, Delete} from '@nestjs/common'
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { CreateVendorDTO, UpdateVendorDTO, VendotrStats } from 'src/core/dtos/vendor.dto';
import { UserRole } from 'src/core/types/UserRole.enum';
import { VendorService } from '../services/vendor.service';
import {ApiTags} from '@nestjs/swagger';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { UpdateResult } from 'typeorm';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
@ApiTags('vendors')
@Controller('vendors')
export class VendorController{
    constructor(
        private readonly vendorService:VendorService
    ){}

    @RequiredRoles(UserRole.JURIDICAL)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Post('')
    async createVendor(@Body() vendor:CreateVendorDTO){
        return await this.vendorService.createVendor(vendor);
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get('stats')
    async getVendorStats(@Query() params:StatsParamsDTO){
      
        return await this.vendorService.getVendorsStats(params)
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get(":id")
    async findById(@Param("id") id:string ){
        return await this.vendorService.findByIdWithRelations(id)
    }

  
    @UseGuards(JwtAccessTokenGuard)
    @Get('')
    async findAll(@Query('offset') offset:number = 0 ,@Query('limit') limit:number = 10 ,@Query('orderBy') orderBy:string  = undefined ,@Query("searchQuery") searchQuery:string = undefined):Promise<PaginationResponse<VendorEntity>>{
        return await  this.vendorService.findAll(offset,limit,orderBy ,searchQuery );
    }   

    @RequiredRoles(UserRole.JURIDICAL)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Patch(':id')
    async updateVendor(@Param('id') id:string,@Body() newVendor:UpdateVendorDTO){
        return await this.vendorService.updateVendor(id,newVendor)
    }

    @RequiredRoles(UserRole.JURIDICAL)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Delete(':id')
    async deleteVendor(@Param('id') vendorId:string){
        return await this.vendorService.deleteVendor(vendorId);
    }

    //testing route
    @Post('/test')
    async createVendorTest(@Body() vendor:CreateVendorDTO){
        return await this.vendorService.createVendor(vendor);
    }


}
