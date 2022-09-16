import { Injectable, InternalServerErrorException, Logger,BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO } from "src/core/dtos/user.dto";
import { DepartementEntity } from "src/core/entities/Departement.entity";
import { DirectionEntity } from "src/core/entities/Direction.entity";
import { UserEntity } from "src/core/entities/User.entity";
import { DepartementService } from "src/direction/services/departement.service";
import { DirectionService } from "src/direction/services/direction.service";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class UserService{
    private logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
        private readonly directionService:DirectionService,
        ){}
    async create(newUser:CreateUserDTO):Promise<UserEntity>{
        const {departementId = null,directionId = null,...userData} = newUser;  
        let direction:DirectionEntity,departement:DepartementEntity;
        if(directionId && departementId){
            direction = await this.directionService.findDirectionWithDepartement(directionId,departementId)
            if(!direction){
                throw new  BadRequestException("direction not found");
            }
            departement = direction.departements.length > 0 ? direction.departements[0]:null;
            if(!departement){
                throw new  BadRequestException("departement is not in direction");
            }
        }
        return this.userRepository.save({...userData,direction,departement});
    }
    async findBy(options:FindOptionsWhere<UserEntity>):Promise<UserEntity>{
        return this.userRepository.findOneBy(options)
    }
    async findByEmailOrUsername({email,username}:{email:string,username:string}):Promise<UserEntity>{
        try{
            return this.userRepository.createQueryBuilder('user')
            .select(['user.password','user.email','user.username','user.id','user.firstName','user.lastName'])
            .where('user.username = :username or user.email = :email',{username,email})
            .getOne();
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }
    async findAndUpdate(userId:string,partialEntity: QueryDeepPartialEntity<UserEntity>):Promise<UpdateResult>{
        return this.userRepository.update({id:userId},partialEntity);
    }
}