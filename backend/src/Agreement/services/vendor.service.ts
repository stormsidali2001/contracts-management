import {Injectable,BadRequestException} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVendorDTO } from 'src/core/dtos/vendor.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VendorService{
    constructor(
        @InjectRepository(VendorEntity) private readonly vendorRepository:Repository<VendorEntity>,
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>
    ){}
    
    async createVendor(vendor:CreateVendorDTO):Promise<VendorEntity>{
        const {agreementIds = [],...vendorData} = vendor;
        if(agreementIds.length === 0) return this.vendorRepository.save({...vendorData});
        const agreements = await this.agreementRepository.createQueryBuilder('ag')
        .where('ag.id in (:...agreementIds)',{agreementIds})
        .getMany();
        if(agreements.length !== agreementIds.length){
            throw new BadRequestException("agreements not found")
        }
        return this.vendorRepository.save({...vendorData,agreements})
    }
}