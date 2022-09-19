import {Controller ,Post ,Get , Body , Param, Put,UseGuards} from '@nestjs/common'
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { CreateVendorDTO } from 'src/core/dtos/vendor.dto';
import { UserRole } from 'src/core/types/UserRole.enum';
import { VendorService } from '../services/vendor.service';
import {ApiTags} from '@nestjs/swagger';
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
}
