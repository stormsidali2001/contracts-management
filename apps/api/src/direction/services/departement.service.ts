import {BadRequestException, Inject, Injectable} from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid';
import { Departement } from '@contracts/domain';
import { CreateDepartementDTO, UpdateDepartementDTO } from 'src/core/dtos/departement.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { TypeOrmDepartementRepository } from '../typeorm-departement.repository';

@Injectable()
export class DepartementService{
    constructor(
        @Inject('IDepartementRepository')
        private readonly departementRepo: TypeOrmDepartementRepository,
    ){}

    async createDepartement(dto:CreateDepartementDTO):Promise<DepartementEntity>{
        const {directionId,...otherDepartementData} = dto;

        const direction = await this.departementRepo.findDirectionById(directionId);
        if(!direction){
            throw new BadRequestException("une erreur lors de la creation de departement")
        }

        const departementDb = await this.departementRepo.findByTitleOrAbbreviationInDirection(
            otherDepartementData.title,
            otherDepartementData.abriviation,
            directionId,
        );
        if(departementDb) throw new BadRequestException("un departement avec les memes identifiant exist deja dans cette direction");

        // Validate domain invariants (throws if title/abriviation invalid)
        Departement.create({
            id: uuidv4(),
            title: otherDepartementData.title,
            abriviation: otherDepartementData.abriviation,
            directionId,
        });

        return this.departementRepo.createAndSave({...otherDepartementData, direction});
    }

    async updateDepartement(id:string,departement:UpdateDepartementDTO):Promise<UpdateResult>{
        return this.departementRepo.update(id, departement);
    }

    async deleteDepartement(id:string):Promise<DeleteResult>{
        const departementDb = await this.departementRepo.findByIdWithUserCount(id);

        if(!departementDb) throw new BadRequestException("le departement n'existe pas.")
        //@ts-ignore
        if(departementDb.users > 0 ) throw new BadRequestException("vous ne pouvez pas supprimer le departement car il contient des utilisateur");
        return this.departementRepo.deleteById(id);
    }

    async findById(id:string):Promise<DepartementEntity>{
        return this.departementRepo.findById(id);
    }

    async findAll(offset:number = 0,limit:number = 10):Promise<DepartementEntity[]>{
        return this.departementRepo.findAllPaginated(offset, limit);
    }
}
