import { Injectable, InternalServerErrorException, Logger,BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO, UpdateUserDTO } from "src/core/dtos/user.dto";
import { DepartementEntity } from "src/core/entities/Departement.entity";
import { DirectionEntity } from "src/core/entities/Direction.entity";
import { PasswordTokenEntity } from "src/core/entities/PasswordToken";
import { UserEntity } from "src/core/entities/User.entity";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
import { DirectionService } from "src/direction/services/direction.service";
import { FindManyOptions, FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class UserService{
    private logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
        private readonly directionService:DirectionService,
        @InjectRepository(PasswordTokenEntity) private readonly passwordTokenRepository:Repository<PasswordTokenEntity>

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
    async findByEmailWithToken(email:string):Promise<UserEntity>{
        return this.userRepository.createQueryBuilder('u')
        .where('u.email = :email',{email})
        .leftJoinAndSelect('u.password_token','password_token')
        .getOne();
    }
    async findByIdWithToken(userId:string):Promise<UserEntity>{
        return this.userRepository.createQueryBuilder('u')
        .where('u.userId = :userId',{userId})
        .leftJoinAndSelect('u.password_token','password_token')
        .getOne();
    }
    async findByEmailOrUsername({email,username}:{email:string,username:string}):Promise<UserEntity>{
        try{
            return this.userRepository.createQueryBuilder('user')
            .select(['user.password','user.email','user.username','user.id','user.firstName','user.lastName','user.imageUrl','user.role'])
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
            .andWhere(`MATCH(user.email) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .andWhere(`MATCH(user.firstName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .andWhere(`MATCH(user.lastName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
           
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
            if(userDb && userDb.id !== id) throw new ForbiddenException("username et l'email   exists deja")
            
   
        return this.userRepository.update(id,newUser)
    }

    async updateUserPassword(userId:string,password:string){
        return this.userRepository.update(userId,{password})
    }

    async findByIdWithDepartementAndDirection(id:string){
        return this.userRepository.createQueryBuilder("u")
        .where('u.id = :id',{id})
        .leftJoinAndSelect("u.departement","dp")
        .leftJoinAndSelect("u.direction","dr")
        .getOne()
    }
    async findAllBy(options:FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[]){
        return this.userRepository.find({where:options})
    }
    async getUserTypesStats(){
        console.log("imak")
        const stats =  await this.userRepository.createQueryBuilder('u')
        .select('count(u.id)','total')
        .addSelect('u.role','role')
        .groupBy('u.role')
        .getRawMany()
        const response:any = {
            juridical:0,
            employee:0,
            admin:0,
            total:0
        }
        stats.forEach(st=>{
            response[st.role] = parseInt(st.total);
        })
        response.total = response.juridical + response.admin + response.employee;
        return response;
    }

    async updateUserPasswordToken(token:string,userId:string){
        return await this.passwordTokenRepository.createQueryBuilder('password_token')
        .where('password_token.userId = :userId',{userId})
        .update()
        .set({token,expiresIn:new Date(Date.now()+1000*60*15)})
        .execute()
    }
    async deleteUserPasswordToken(userId:string){
        return await this.passwordTokenRepository.createQueryBuilder()
        .where('password_token.userId = :userId',{userId})
        .delete()
        .execute();
    }
}