import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDepartementDTO, UpdateDepartementDTO } from 'src/core/dtos/departement.dto';
import { CreateUserDTO } from 'src/core/dtos/user.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
@Injectable()
export class DepartementService{
    constructor(
        @InjectRepository(DepartementEntity) private readonly departementRepository:Repository<DepartementEntity>,
        @InjectRepository(DirectionEntity) private readonly directionRepository:Repository<DirectionEntity>

    ){}

    async createDepartement(departement:CreateDepartementDTO):Promise<DepartementEntity>{
        const {directionId,...otherDepartementData} = departement;
       
        
        const direction = await this.directionRepository.findOneBy({id:directionId});
        
        if(!direction){
            throw new BadRequestException("une erreur lors de la creation de departement")
        }
        const departementDb = await this.departementRepository.createQueryBuilder('d')
        .where('d.title = :title or d.abriviation = :abriviation',{title:otherDepartementData.title,abriviation:otherDepartementData.abriviation})
        .andWhere("d.directionId = :directionId",{directionId:directionId})
        .getOne();
        if(departementDb) throw new BadRequestException("un departement avec les memes identifiant exist deja dans cette direction");
        const departementEntity =  this.departementRepository.create({...otherDepartementData,direction});
        return this.departementRepository.save(departementEntity);
    }
    async updateDepartement(id:string,departement:UpdateDepartementDTO):Promise<UpdateResult>{
        return this.departementRepository.update(id,departement)
    }
    async deleteDepartement(id:string):Promise<DeleteResult>{
        const departementDb = await this.departementRepository.createQueryBuilder('dp')
        .where('dp.id = :departementId',{departementId:id})
        .loadRelationCountAndMap('dp.users','dp.employees','users')
        .getOne();

        if(!departementDb) throw new BadRequestException("le departement n'existe pas.")
        //@ts-ignore
        if(departementDb.users > 0 ) throw new BadRequestException("vous ne pouvez pas supprimer le departement car il contient des utilisateur");
        return this.departementRepository.delete(id);
    }
    async findById(id:string):Promise<DepartementEntity>{
        return this.departementRepository.findOneBy({id})
    }
    async findAll(offset:number = 0,limit:number = 10):Promise<DepartementEntity[]>{
        return this.departementRepository.createQueryBuilder('departement')
        .loadRelationCountAndMap('departement.users','departements.employees')
        .take(limit)
        .skip(offset)
        .getMany();
        
    }
    


}