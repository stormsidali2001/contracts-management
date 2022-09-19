import {Injectable,BadRequestException} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVendorDTO } from 'src/core/dtos/vendor.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class VendorService{
    constructor(
        @InjectRepository(VendorEntity) private readonly vendorRepository:Repository<VendorEntity>,
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>
    ){}
    
    async createVendor(vendor:CreateVendorDTO):Promise<VendorEntity>{
        const {...vendorData} = vendor;
        return this.vendorRepository.save({...vendorData});
        
    }
    async findBy(options:FindOptionsWhere<VendorEntity>){
        return this.vendorRepository.findOneBy(options);
    }
    async findAll(offset:number = 0 ,limit:number = 10 ,orderBy:string = undefined):Promise<PaginationResponse<VendorEntity>>{
        let query =    this.vendorRepository.createQueryBuilder('vendor')
        .skip(offset)
        .take(limit);
        if(orderBy){
            query = query.orderBy(`${orderBy}`);
        }
        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    }   
}