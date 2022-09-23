import {Controller ,Post ,Get , Body , Param, Put,UseGuards , Query} from '@nestjs/common'
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { CreateVendorDTO } from 'src/core/dtos/vendor.dto';
import { UserRole } from 'src/core/types/UserRole.enum';
import { VendorService } from '../services/vendor.service';
import {ApiTags} from '@nestjs/swagger';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
@ApiTags('vendors')
@Controller('vendors')
// @RequiredRoles(UserRole.JURIDICAL,UserRole.ADMIN)
// @UseGuards(JwtAccessTokenGuard,RoleGuard)
export class VendorController{
    constructor(
        private readonly vendorService:VendorService
    ){}
    @Post('')
    async createVendor(@Body() vendor:CreateVendorDTO){
        return await this.vendorService.createVendor(vendor);
    }
    @Get(":id")
    async findById(@Param("id") id:string ){
        return await this.vendorService.findByIdWithRelations(id)
    }

    @Get('')
    async findAll(@Query('offset') offset:number = 0 ,@Query('limit') limit:number = 10 ,@Query('orderBy') orderBy:string  = undefined ,@Query("searchQuery") searchQuery:string = undefined):Promise<PaginationResponse<VendorEntity>>{
        return await  this.vendorService.findAll(offset,limit,orderBy ,searchQuery );
    }   
}
