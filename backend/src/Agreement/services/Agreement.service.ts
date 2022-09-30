import {Injectable , BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAgreementDTO } from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DirectionService } from 'src/direction/services/direction.service';
import {  Repository } from 'typeorm';
import { UserNotificationService } from '../../user/user-notification.service';
import { VendorService } from './vendor.service';


@Injectable()
export class AgreementService{
    constructor(
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>,
        private readonly vendorService:VendorService,
        private readonly directionService:DirectionService,
        private readonly userNotificationService:UserNotificationService
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
      

        const res= await  this.agreementRepository.save({...agreementData,direction,departement,vendor});
        await this.userNotificationService.sendToUsersInDepartement(departement.id,`${agreement.type === AgreementType.CONTRACT ? "un nouveau contrat est ajoute a votre departement":"une nouvelle convension a etee ajoutee a votre departement"} avec le fournisseur: ${vendor.company_name}`)
        return res;
    }

    async findAll(offset:number = 0 ,limit:number = 10 ,orderBy:string = undefined,agreementType:AgreementType,searchQuery:string = undefined):Promise<PaginationResponse<AgreementEntity>>{
        let query =    this.agreementRepository.createQueryBuilder('ag')
        .where("ag.type = :type",{type:agreementType})
        .skip(offset)
        .take(limit);

        if(searchQuery && searchQuery.length >= 2){
            query = query.where(`MATCH(ag.number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(ag.object) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(ag.observation) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
           
        }
        if(orderBy && orderBy!== 'type'){
            query = query.orderBy(`${orderBy}`);
        }
        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    } 
    
    async findById(id:string,agrreementType:AgreementType = AgreementType.CONTRACT){
        return await this.agreementRepository.createQueryBuilder("ag")
        .where("ag.type = :agrreementType",{agrreementType})
        .andWhere("ag.id = :id",{id})
        .leftJoinAndSelect("ag.direction","direction")
        .leftJoinAndSelect("ag.departement","departement")
        .leftJoinAndSelect("ag.vendor","vendor")
        .getOne();
    }
}