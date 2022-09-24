import {Injectable,BadRequestException, ForbiddenException} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';

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
    async findAll(offset:number = 0 ,limit:number = 10 ,orderBy:string = undefined ,searchQuery:string = undefined):Promise<PaginationResponse<VendorEntity>>{
        let query =    this.vendorRepository.createQueryBuilder('vendor')
        .skip(offset)
        .take(limit);
        if(searchQuery && searchQuery.length >= 2){
            query = query.where(`MATCH(vendor.company_name) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(vendor.nif) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(vendor.nrc) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(vendor.address) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(vendor.home_phone_number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(vendor.mobile_phone_number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(vendor.num) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
           
        }
        if(orderBy){
            query = query.orderBy(`${orderBy}`);
        }

        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    }   

    async findByIdWithRelations(id:string){
        return this.vendorRepository.createQueryBuilder("vendor")
        .where("vendor.id = :id",{id})
        .loadRelationCountAndMap("vendor.contractCount","vendor.agreements","agreements",qb=>qb.where("agreements.type = :agreementType",{agreementType:AgreementType.CONTRACT}))
        .loadRelationCountAndMap("vendor.convensionCount","vendor.agreements","agreements",qb=>qb.where("agreements.type = :agreementType",{agreementType:AgreementType.CONVENSION}))
        .getOne()
    }
    async updateVendor(id:string,newVendor:UpdateVendorDTO):Promise<UpdateResult>{
            const {address,home_phone_number,mobile_phone_number,...uniques} = newVendor;
            Object.keys(uniques).forEach(key=>{
                if(!uniques[key]) delete uniques[key];
            })
            const vendorDb = await this.vendorRepository.findOneBy({...uniques})
            if(vendorDb) throw new ForbiddenException("nif , nrc , company_name  ,num should be unique")
            
        return this.vendorRepository.update(id,newVendor)
    }
}