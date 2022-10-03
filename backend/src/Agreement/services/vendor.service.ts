import {Injectable,BadRequestException, ForbiddenException} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class VendorService{
    constructor(
        @InjectRepository(VendorEntity) private readonly vendorRepository:Repository<VendorEntity>,
        @InjectRepository(VendorStatsEntity) private readonly vendorStatsRepository:Repository<VendorStatsEntity>
    ){}
    
    async createVendor(vendor:CreateVendorDTO):Promise<VendorEntity>{
        const {address,home_phone_number,mobile_phone_number,...uniques} = vendor;
        let condition = '';
        const uniquesKeys = Object.keys(uniques);
        uniquesKeys.forEach((k,index)=>{
            if(!uniques[k]) delete uniques[k];
            if(uniques[k]) condition += `v.${k} = :${k} ${(index !==uniquesKeys.length-1)?"or ":""}`
        })

        const vendorDb = await this.vendorRepository.createQueryBuilder('v')
        .where(condition,{...uniques})
        .getOne();

        if(vendorDb) throw new ForbiddenException("nif , nrc , company_name  ,num doit etre unique")
        const createdVendor = await this.vendorRepository.save({address,home_phone_number,mobile_phone_number,...uniques});
        const vendorStatsDb = await this.vendorStatsRepository.findOneBy({date:new Date(Date.now())})
        if(vendorStatsDb){
            await this.vendorStatsRepository.update({id:vendorStatsDb.id},{nb_vendors:()=>"nb_vendors + 1"})
        }else{
            await this.vendorStatsRepository.save({date:new Date(Date.now()),nb_vendors:1})
        }
        return createdVendor;
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
            let condition = '';
            const uniquesKeys = Object.keys(uniques);
            uniquesKeys.forEach((k,index)=>{
                if(!uniques[k]) delete uniques[k];
                if(uniques[k]) condition += `v.${k} = :${k} ${(index !==uniquesKeys.length-1)?"or ":""}`
            })
            const vendorDb = await this.vendorRepository.createQueryBuilder("v")
            .where(condition,{...uniques})
            .getOne();
            if(vendorDb && vendorDb.id !== id ) throw new ForbiddenException("nif , nrc , company_name  ,num doit etre unique")
            
        return this.vendorRepository.update(id,newVendor)
    }
}