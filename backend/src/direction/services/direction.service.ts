import {BadRequestException, Injectable} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDirectionDTO, updateDirectionDTO } from 'src/core/dtos/direction.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { InsertResult, Repository ,DataSource, EntityManager, UpdateResult} from 'typeorm';
@Injectable()
export class DirectionService{
    constructor(
        @InjectRepository(DirectionEntity) private readonly directionRepository:Repository<DirectionEntity>,
        private dataSource:DataSource
    ){}
    async createDirection(direction:CreateDirectionDTO):Promise<InsertResult>{

      return  await this.dataSource.manager.transaction(async (entityManger:EntityManager)=>{
        const newDirection = await entityManger.getRepository(DirectionEntity).save({title:direction.title});
        const departementRepository = entityManger.getRepository(DepartementEntity);
        return departementRepository.insert(direction.departements.map(dp=>{
            const departement = departementRepository.create({...dp,direction:newDirection})
            return departement;
       }))
       })
    
    }
    async findAll(offset:number = 0 , limit:number = 10):Promise<DirectionEntity[]>{
        return this.directionRepository.createQueryBuilder('direction')
        .leftJoinAndSelect('direction.departements','departements')
        .skip(offset)
        .take(limit)
        .getMany();
    }
    async findDirectionWithDepartement(directionId:string,departementId:string){
        return this.directionRepository.createQueryBuilder("dr")
        .where('dr.id = :directionId',{directionId})
        .leftJoinAndSelect('dr.departements','dp')
        .andWhere('dp.id = :departementId',{departementId})
        .getOne();
    }
    async find(id:string):Promise<DirectionEntity>{
        return this.directionRepository.findOneBy({id});
    }
    async deleteDirection(id:string):Promise<string>{
       return   this.dataSource.manager.transaction(async (entityManager:EntityManager)=>{
            const directionRepository = entityManager.getRepository(DirectionEntity);
            const departementRepository = entityManager.getRepository(DepartementEntity);
            const direction = await directionRepository.createQueryBuilder('direction')
            .where('direction.id = :id',{id})
            .leftJoinAndSelect('direction.departements','departements')
            .getOne();
            if(!direction){
                throw new BadRequestException("could not find direction");
            }
            await departementRepository.createQueryBuilder()
            .delete()
            .where('departements.id in (:...ids)',{ids:direction.departements.map(dp=>dp.id)})
            .execute();

            await directionRepository.delete(id);
            return "done";

        })
    }
    async updateDirection(id:string,direction:updateDirectionDTO):Promise<UpdateResult>{
        return this.directionRepository.update(id,direction);
    }
    
  
}