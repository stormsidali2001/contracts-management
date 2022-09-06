import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO } from "src/core/dtos/user.dto";
import { UserEntity } from "src/core/entities/User.entity";
import { FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class UserService{
    private logger = new Logger(UserService.name);
    constructor(@InjectRepository(UserEntity) private userRepository:Repository<UserEntity>){}
    async create(newUser:CreateUserDTO):Promise<UserEntity>{
        return this.userRepository.save(newUser);
    }
    async findBy(options:FindOptionsWhere<UserEntity>):Promise<UserEntity>{
        return this.userRepository.findOneBy(options)
    }
    async findByEmailOrUsername({email,username}:{email:string,username:string}):Promise<UserEntity>{
        try{
            return this.userRepository.createQueryBuilder('user')
            .where('user.username = :username or user.email = :email',{username,email})
            .getOne();
        }catch(err){
            this.logger.error(err)
        }
    }
}