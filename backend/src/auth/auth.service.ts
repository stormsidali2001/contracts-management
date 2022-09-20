import { HttpStatus, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, LoginUserDTO } from "src/core/dtos/user.dto";
import { UserEntity } from "src/core/entities/User.entity";
import { UserService } from "src/user/user.service";
import { JwtCompletePayload, JwtPayload } from "./types/JwtPayload.interface";
import {JwtService} from '@nestjs/jwt'
import { ConfigService } from "@nestjs/config";
import { Tokens } from "./types/tokens.interface";
import * as argon2 from 'argon2';
import { UserRole } from "src/core/types/UserRole.enum";
import { randomBytes } from "crypto";
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class AuthService{
    private logger = new Logger(AuthService.name);
    constructor(
        private userService:UserService,
        private jwtService:JwtService,
        private configService:ConfigService
    ){}
    async #hashPassword(password:string):Promise<string>{
        return bcrypt.hash(password,12);
    }
    async #comparePassword(password:string,passwordDb:string):Promise<boolean>{
        return bcrypt.compare(password,passwordDb);
    }
    async #generateTokens(jwtPayload:JwtPayload):Promise<Tokens>{
        const [access_token , refresh_token] = await Promise.all([
            this.jwtService.signAsync({user:jwtPayload},{
                secret:this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn:this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN')
            }),
            this.jwtService.signAsync({user:jwtPayload},{
                secret:this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn:this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN')
            })
        ]);


        return {
            access_token,
            refresh_token
        }
    }
    async #updateRefreshTokenHash(userId:string,refresh_token:string):Promise<void>{
        const refresh_token_hash = await argon2.hash(refresh_token)
         await this.userService.findAndUpdate(userId,{refresh_token_hash})
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
                if(newUser.username &&(userDb.username === newUser.username)){
                    if(emailsMatch) msg += ',\n';
                    msg += "username already taken";
                }
                throw new UnauthorizedException(msg);
            }
            if(!newUser.username){
                newUser.username =  newUser.firstName + uuidv4();
            }
            if(newUser.password){
                newUser.password = await this.#hashPassword(newUser.password);
            }else{
                newUser.password =await new Promise((resolve,reject)=>{
                    randomBytes(32,(err,buf)=>{
                        if(err) reject(err);
                        resolve(buf.toString('hex'))
                    })
                }) 
            }
            return this.userService.create(newUser);
        }catch(err){    
            throw new InternalServerErrorException(err);
        }
    }

    async login(user:LoginUserDTO){
       try{

           const userDb = await this.userService.findByEmailOrUsername({email:user.email,username:user.username});
           console.log(userDb,'login ...........')
           
           if(!userDb){
                throw new UnauthorizedException("wrong credentials")
           }
    
           const matches = await this.#comparePassword(user.password,userDb.password)
           if(!matches){
                throw new UnauthorizedException("wrong credentials")
           }
           const tokens = await this.#generateTokens({email:userDb.email , username:userDb.username, sub:userDb.id,firstName:userDb.firstName ,lastName:userDb.lastName});
           await this.#updateRefreshTokenHash(userDb.id,tokens.refresh_token);
           return tokens;
       }catch(err){
           throw new InternalServerErrorException(err);
       }

    }

    async verifyAccessToken(userId:string):Promise<{role:UserRole}>{
        try{
          const user = await this.userService.findBy({id:userId});
          return {role:user.role};
            
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }
}