import { BadRequestException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
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
        const refresh_token_hash = await bcrypt.hash(refresh_token,12)
         await this.userService.findAndUpdate(userId,{refresh_token_hash})
    }
    async register(newUser:CreateUserDTO):Promise<UserEntity>{
       
            const userDb = await this.userService.findByEmailOrUsername({email:newUser.email,username:newUser.username});
            if(userDb){
                let msg = '';
                const emailsMatch = (userDb.email === newUser.email);
                if(emailsMatch){
                    msg += "le email est deja pris";
                }
                if(newUser.username &&(userDb.username === newUser.username)){
                    if(emailsMatch) msg += ',\n';
                    msg += "le nom d'utilisateur est deja pris";
                }
                throw new BadRequestException(msg);
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
      
    }

    async login(user:LoginUserDTO){
       try{

           const userDb = await this.userService.findByEmailOrUsername({email:user.email,username:user.username});
           
           if(!userDb){
                throw new UnauthorizedException("wrong credentials")
           }
    
           const matches = await this.#comparePassword(user.password,userDb.password)
           if(!matches){
                throw new UnauthorizedException("wrong credentials")
           }
           const tokens = await this.#generateTokens({email:userDb.email , username:userDb.username, sub:userDb.id,firstName:userDb.firstName ,lastName:userDb.lastName,imageUrl:userDb.imageUrl,role:userDb.role});
           await this.#updateRefreshTokenHash(userDb.id,tokens.refresh_token);

           return tokens;
       }catch(err){
           throw new ForbiddenException(err);
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

    async refresh_token(id:string,refresh_token:string){
            try{
                const userDb = await this.userService.findBy({id})
                if(!userDb || !userDb?.refresh_token_hash){
                    throw new ForbiddenException("user deleted or loged out")
                }
                Logger.warn(`
                useDb.refresh_token_hash: ${userDb.refresh_token_hash} 
                    refresh token : ${refresh_token}
                `,"refresh token debug");
                const equal = await bcrypt.compare(refresh_token,userDb.refresh_token_hash)
                console.log("equal",equal,userDb.refresh_token_hash)

                if(!equal){
                    throw new ForbiddenException("old token")
                }
                
                const tokens = await this.#generateTokens({email:userDb.email , username:userDb.username, sub:userDb.id,firstName:userDb.firstName ,lastName:userDb.lastName,imageUrl:userDb.imageUrl,role:userDb.role});
                await this.#updateRefreshTokenHash(userDb.id,tokens.refresh_token);
                return tokens;
            }catch(err){
                throw new InternalServerErrorException(err);
            }
    }
}