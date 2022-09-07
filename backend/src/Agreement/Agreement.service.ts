import {Injectable , BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAgreementDTO } from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import {  Repository } from 'typeorm';


@Injectable()
export class AgreementService{
    constructor(
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>,
        @InjectRepository(DirectionEntity) private readonly directionRepository:Repository<DirectionEntity>,
        @InjectRepository(DepartementEntity) private readonly departementRepository:Repository<DepartementEntity>,
        @InjectRepository(VendorEntity) private readonly vendorRepository:Repository<VendorEntity>
    ){}
    async createAgreement(agreement:CreateAgreementDTO):Promise<AgreementEntity>{
        const {directionId , departementId , vendorId, ...agreementData} = agreement;
        const [direction,departement,vendor] = await Promise.all([
                        this.directionRepository.findOneBy({id:directionId}),
                        this.departementRepository.findOneBy({id:departementId}),
                        this.vendorRepository.findOneBy({id:vendorId})
                 ]);
        let str = "";
        if(!direction){
            str += "direction"
        }
        if(!departement){
            str += ", departement"
        }
        if(!vendor){
            str += "vendor"
        }
        if(!direction || !vendor || !departement){
            throw new BadRequestException(`${str} not found`);
        }

        return this.agreementRepository.save({...agreementData,direction,departement,vendor});
    }
}