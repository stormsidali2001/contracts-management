import {Inject,Injectable,BadRequestException, ForbiddenException, Logger, NotFoundException} from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid';
import { Vendor } from '@contracts/domain';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { UserNotificationService } from 'src/user/user-notification.service';
import { FindOptionsWhere } from 'typeorm';
import { VendorMapper } from '../vendor.mapper';
import { TypeOrmVendorRepository } from '../typeorm-vendor.repository';

@Injectable()
export class VendorService{

    constructor(
        @Inject('IVendorRepository') private readonly vendorRepo: TypeOrmVendorRepository,
        private notificationService:UserNotificationService,
    ){}

    async createVendor(dto:CreateVendorDTO):Promise<VendorEntity>{
        const {address,home_phone_number,mobile_phone_number,createdAt,...uniques} = dto;
        let condition = '';
        const uniquesKeys = Object.keys(uniques);
        uniquesKeys.forEach((k,index)=>{
            if(!uniques[k]) delete uniques[k];
            if(uniques[k]) condition += `v.${k} = :${k} ${(index !==uniquesKeys.length-1)?"or ":""}`
        })

        const vendorDb = await this.vendorRepo.findByUniqueCondition(condition, {...uniques});

        if(vendorDb) throw new ForbiddenException("nif , nrc , company_name  ,num doit etre unique")

        // Create domain object — validates all invariants
        const vendor = Vendor.create({
            id: uuidv4(),
            num: dto.num,
            name: dto.company_name,
            nif: dto.nif,
            nrc: dto.nrc,
            address: dto.address,
            mobilePhone: dto.mobile_phone_number,
            homePhone: dto.home_phone_number,
        });

        const createdVendor = await this.vendorRepo.createVendorWithStats(
            {
                ...VendorMapper.toPersistence(vendor),
                createdAt: createdAt ? createdAt : new Date(),
            },
            createdAt ? createdAt : new Date(),
        );

        await this.notificationService.sendEventToAllUsers({entity:Entity.VENDOR,operation:Operation.INSERT,entityId:createdVendor.id,createdAt:new Date()})
        return createdVendor;
    }

    async findBy(options:FindOptionsWhere<VendorEntity>){
        return this.vendorRepo.findOneBy(options);
    }

    async findAll(offset:number = 0,limit:number = 10,orderBy:string = undefined,searchQuery:string = undefined):Promise<PaginationResponse<VendorEntity>>{
        return this.vendorRepo.findPaginated(offset, limit, orderBy, searchQuery);
    }

    async findByIdWithRelations(id:string){
        return this.vendorRepo.findByIdWithRelationCounts(id);
    }

    async updateVendor(id:string,dto:UpdateVendorDTO){
        const {address,home_phone_number,mobile_phone_number,...uniques} = dto;
        let condition = '';
        const uniquesKeys = Object.keys(uniques);
        uniquesKeys.forEach((k,index)=>{
            if(!uniques[k]) delete uniques[k];
            if(uniques[k]) condition += `v.${k} = :${k} ${(index !==uniquesKeys.length-1)?"or ":""}`
        })
        const vendorDb = await this.vendorRepo.findByUniqueCondition(condition, {...uniques});
        if(vendorDb && vendorDb.id !== id) throw new ForbiddenException("nif , nrc , company_name  ,num doit etre unique")

        // Load domain object and apply update
        const existing = await this.vendorRepo.findById(id);
        if(!existing) throw new NotFoundException('fournisseur non trouvé');
        existing.update({
            num: dto.num,
            name: dto.company_name,
            nif: dto.nif,
            nrc: dto.nrc,
            address: dto.address,
            mobilePhone: dto.mobile_phone_number,
            homePhone: dto.home_phone_number,
        });
        await this.vendorRepo.save(existing);

        await this.notificationService.sendEventToAllUsers({entity:Entity.VENDOR,operation:Operation.UPDATE,entityId:id,createdAt:new Date(),departementAbriviation:"",directionId:null,departementId:null,directionAbriviation:""})
        // Return the updated entity for the existing HTTP contract
        return this.vendorRepo.findOneBy({ id });
    }

    async getVendorsStats({startDate,endDate}:StatsParamsDTO){
        return this.vendorRepo.getVendorsStats({ startDate, endDate });
    }

    async deleteVendor(vendorId:string){
        const vendorDb = await this.vendorRepo.findByIdWithAgreementCount(vendorId);

        if(!vendorDb) throw new NotFoundException("fournisseur non trouvé");

        // Use domain to enforce the deletion invariant
        const vendor = VendorMapper.toDomain(vendorDb);
        //@ts-ignore
        if(!vendor.canBeDeleted(vendorDb.agreementCount)){
            //@ts-ignore
            throw new NotFoundException(`le fournisseur ne peut pas etre supprimer car il a ${vendorDb.agreementCount} accords`);
        }

        await this.vendorRepo.deleteById(vendorId);
        await this.notificationService.sendEventToAllUsers({entity:Entity.VENDOR,operation:Operation.DELETE,entityId:vendorDb.id,createdAt:new Date(),departementAbriviation:"",directionId:null,departementId:null,directionAbriviation:""})
    }
}
