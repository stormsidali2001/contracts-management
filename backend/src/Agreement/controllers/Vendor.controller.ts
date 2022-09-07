import {Controller ,Post ,Get , Body , Param, Put} from '@nestjs/common'
import { CreateVendorDTO } from 'src/core/dtos/vendor.dto';
import { VendorService } from '../services/vendor.service';

@Controller('vendors')
export class VendorController{
    constructor(
        private readonly vendorService:VendorService
    ){}
    @Post('')
    async createVendor(@Body() vendor:CreateVendorDTO){
        return await this.vendorService.createVendor(vendor);
    }
}
