import {Injectable , BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAgreementDTO } from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { DirectionService } from 'src/direction/services/direction.service';
import {  Repository } from 'typeorm';


@Injectable()
export class AgreementService{
    constructor(
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>,
        @InjectRepository(VendorEntity) private readonly vendorRepository:Repository<VendorEntity>,
        private readonly directionService:DirectionService
    ){}
    async createAgreement(agreement:CreateAgreementDTO):Promise<AgreementEntity>{
        const {directionId , departementId , vendorIds, ...agreementData} = agreement;
        const [direction,vendors] = await Promise.all([
                        this.directionService.findDirectionWithDepartement(directionId,departementId),
                        this.vendorRepository.createQueryBuilder('vendor')
                        .where('vendor.id in (:...vendorIds)',{vendorIds})
                        .getMany()
                 ]);
        if(!direction){
            throw new  BadRequestException("direction not found");
        }
        const departement = direction.departements.length > 0 ? direction.departements[0]:null;
        if(!departement){
            throw new  BadRequestException("departement is not in direction");
        }
       
        if(vendorIds.length != vendors.length){
            throw new  BadRequestException("cound not find one or more  vendor");
        }
      

        return this.agreementRepository.save({...agreementData,direction,departement,vendors});
    }
}