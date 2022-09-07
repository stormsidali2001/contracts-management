import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO } from "src/core/dtos/user.dto";
import { UserEntity } from "src/core/entities/User.entity";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class UserService{
    private logger = new Logger(UserService.name);
    constructor(@InjectRepository(UserEntity) private userRepository:Repository<UserEntity>){}
    async create(newUser:CreateUserDTO):Promise<UserEntity>{
        console.log("there.............",newUser)
        return this.userRepository.save({...newUser});
    }
    async findBy(options:FindOptionsWhere<UserEntity>):Promise<UserEntity>{
        return this.userRepository.findOneBy(options)
    }
    async findByEmailOrUsername({email,username}:{email:string,username:string}):Promise<UserEntity>{
        try{
            return this.userRepository.createQueryBuilder('user')
            .select(['user.password','user.email','user.username'])
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