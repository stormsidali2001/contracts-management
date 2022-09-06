import { HttpStatus, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from "src/core/dtos/user.dto";
import { UserEntity } from "src/core/entities/User.entity";
import { UserService } from "src/user/user.service";
@Injectable()
export class AuthService{
    private logger = new Logger(AuthService.name);
    constructor(
        private userService:UserService
    ){}
    async hashPassword(password:string):Promise<string>{
        return bcrypt.hash(password,12);
    }
    async comparePassword(password:string,passwordDb:string):Promise<boolean>{
        return bcrypt.compare(password,passwordDb);
    }
    async register(newUser:CreateUserDTO):Promise<UserEntity>{
        try{
            const userDb = await this.userService.findByEmailOrUsername({email:newUser.email,username:newUser.username});
            if(userDb){
                let msg = '';
                const emailsMatch = (userDb.email === newUser.email);
                if(emailsMatch){
                    msg += "email already taken";
                }
                if(userDb.username === newUser.username){
                    if(emailsMatch) msg += ',\n';
                    msg += "username already taken";
                }
                throw new UnauthorizedException(msg);
            }
            newUser.password = await this.hashPassword(newUser.password);
            return this.userService.create(newUser);
        }catch(err){    
            throw new InternalServerErrorException(err);
        }
    }

}