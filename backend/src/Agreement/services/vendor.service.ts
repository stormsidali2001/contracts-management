import {Injectable,BadRequestException, ForbiddenException, Logger, NotFoundException} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { UserNotificationService } from 'src/user/user-notification.service';
import { DataSource, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class VendorService{
    
    constructor(
        @InjectRepository(VendorEntity) private readonly vendorRepository:Repository<VendorEntity>,
        @InjectRepository(VendorStatsEntity) private readonly vendorStatsRepository:Repository<VendorStatsEntity>,

        @InjectDataSource() private dataSource:DataSource,
        private notificationService:UserNotificationService
    ){}
    #format(d:Date){
        const newD = new Date(d);
        return newD.toISOString().replace(/T[0-9:.Z]*/g,"");
    
    }
    
    async createVendor(vendor:CreateVendorDTO):Promise<VendorEntity>{
        const {address,home_phone_number,mobile_phone_number,createdAt,...uniques} = vendor;
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
        const createdVendor = await this.dataSource.transaction(async manager =>{
            const vendorRepository = manager.getRepository(VendorEntity);
            const vendorStatsRepository = manager.getRepository(VendorStatsEntity)

            const createdVendor = await vendorRepository.save({address,createdAt,home_phone_number,mobile_phone_number,...uniques});
      
            const vendorStatsDb = await vendorStatsRepository.findOneBy({date:createdAt})
            if(vendorStatsDb){
                await vendorStatsRepository.update({id:vendorStatsDb.id},{nb_vendors:()=>"nb_vendors + 1"})
            }else{
                await vendorStatsRepository.save({date:createdAt,nb_vendors:1})
            }

            return createdVendor;
        })
        await this.notificationService.sendEventToAllUsers({entity:Entity.VENDOR,operation:Operation.INSERT,entityId:createdVendor.id,createdAt:new Date()})

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

    async getVendorsStats({startDate,endDate}:StatsParamsDTO){
        let  query =   this.vendorStatsRepository.createQueryBuilder('v')
        .orderBy('v.date')

        console.log("k....k",startDate,endDate)
       

        if(startDate ){
            query = query 
            .where("v.date >= :startDate",{startDate})
            
        }
        if(endDate){
            query = query.andWhere('v.date <= :endDate',{endDate});
        }

        return query.getMany();
    }
    async deleteVendor(vendorId:string){
        const vendorDb = await this.vendorRepository.createQueryBuilder('v')
        .where('v.id = :vendorId',{vendorId})
        .loadRelationCountAndMap('v.agreementCount','v.agreements')
        .getOne();

        if(!vendorDb) throw new NotFoundException("fournisseur non trouvé");
        //@ts-ignore
        if(vendorDb.agreementCount > 0)throw new NotFoundException(`le fournisseur ne peut pas etre supprimer car il a ${vendorDb.agreementCount} accords`);

        await this.vendorRepository.createQueryBuilder()
        .delete()
        .where('vendors.id = :vendorId',{vendorId})
        .execute()
    }
}