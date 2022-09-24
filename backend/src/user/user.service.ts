import { Injectable, InternalServerErrorException, Logger,BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO, UpdateUserDTO } from "src/core/dtos/user.dto";
import { DepartementEntity } from "src/core/entities/Departement.entity";
import { DirectionEntity } from "src/core/entities/Direction.entity";
import { UserEntity } from "src/core/entities/User.entity";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
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
            .select(['user.password','user.email','user.username','user.id','user.firstName','user.lastName','user.imageUrl'])
            .where('user.username = :username or user.email = :email',{username,email})
            .getOne();
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }
    async findAndUpdate(userId:string,partialEntity: QueryDeepPartialEntity<UserEntity>):Promise<UpdateResult>{
        return this.userRepository.update({id:userId},partialEntity);
    }
    async findAll(offset:number = 0 ,limit:number = 10 ,orderBy:string = undefined ,searchQuery:string = undefined):Promise<PaginationResponse<UserEntity>>{
        let query =    this.userRepository.createQueryBuilder('user')
        .skip(offset)
        .take(limit);

        if(searchQuery && searchQuery.length >= 2){
            query = query.where(`MATCH(user.username) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(user.firstName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(user.lastName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(user.email) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
           
        }
        if(orderBy){
            query = query.orderBy(`${orderBy}`);
        }
        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    }   
    // async deleteUser(id:string): Promise<string>{
       
    // }
    async updateUser(id:string,newUser:UpdateUserDTO):Promise<UpdateResult>{
       
            const userDb = await this.userRepository.findOneBy({username:newUser.username,email:newUser.email})
            if(userDb) throw new ForbiddenException("username or email already  exists")
            
   
        return this.userRepository.update(id,newUser)
    }
}