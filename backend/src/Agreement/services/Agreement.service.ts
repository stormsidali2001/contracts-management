import {Injectable , BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAgreementDTO } from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DirectionService } from 'src/direction/services/direction.service';
import {  Repository } from 'typeorm';
import { VendorService } from './vendor.service';


@Injectable()
export class AgreementService{
    constructor(
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>,
        private readonly vendorService:VendorService,
        private readonly directionService:DirectionService
    ){}
    async createAgreement(agreement:CreateAgreementDTO):Promise<AgreementEntity>{
        const {directionId , departementId , vendorId, ...agreementData} = agreement;
        const [direction,vendor] = await Promise.all([
                        this.directionService.findDirectionWithDepartement(directionId,departementId),
                        this.vendorService.findBy({id:vendorId})
                 ]);
        if(!direction){
            throw new  BadRequestException("direction not found");
        }
        const departement = direction.departements.length > 0 ? direction.departements[0]:null;
        if(!departement){
            throw new  BadRequestException("departement is not in direction");
        }
       
        if(!vendor){
            throw new  BadRequestException("cound not find the vendor");
        }
      

        return this.agreementRepository.save({...agreementData,direction,departement,vendor});
    }

    async findAll(offset:number = 0 ,limit:number = 10 ,orderBy:string = undefined):Promise<PaginationResponse<AgreementEntity>>{
        let query =    this.agreementRepository.createQueryBuilder('ag')
        .skip(offset)
        .take(limit);
        if(orderBy && orderBy!== 'type'){
            query = query.orderBy(`${orderBy}`);
        }
        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    }    
}