import {Injectable} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDirectionDTO } from 'src/core/dtos/direction.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { Repository } from 'typeorm';
@Injectable()
export class DirectionService{
    constructor(
        @InjectRepository(DirectionEntity) private readonly directionRepository:Repository<DirectionEntity>,
        @InjectRepository(DepartementEntity) private readonly departementRepository:Repository<DepartementEntity>
    ){}
    async createDirection(direction:CreateDirectionDTO){
       const newDirection = this.directionRepository.create({title:direction.title});
       newDirection.departements = [];
       direction.departements.forEach(dp=>{
        const departement = this.departementRepository.create({title:dp.title})
        newDirection.departements.push(departement);
       })
       return this.directionRepository.save(newDirection);
    }
  
}