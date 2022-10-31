import { BadRequestException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { ConnectedUserResetPassword, CreateUserDTO, ForgotPasswordDTO, LoginUserDTO, ResetPasswordDTO } from "src/core/dtos/user.dto";
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
import * as nodemailer from 'nodemailer';


@Injectable()
export class AuthService{
    private logger = new Logger(AuthService.name);
    constructor(
        private userService:UserService,
        private jwtService:JwtService,
        private configService:ConfigService,
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
       
            const userDb = await this.userService.findByEmailOrUsername({email:newUser.email ?? undefined,username:newUser.username ?? undefined});
            Logger.debug(JSON.stringify(userDb),'kkkkkkkk')
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
           const tokens = await this.#generateTokens({email:userDb.email , username:userDb.username, sub:userDb.id,firstName:userDb.firstName ,lastName:userDb.lastName,imageUrl:userDb.imageUrl,role:userDb.role,recieve_notifications:userDb.recieve_notifications});
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
              
                const equal = await bcrypt.compare(refresh_token,userDb.refresh_token_hash)

                if(!equal){
                    throw new ForbiddenException("old token")
                }
                
                const tokens = await this.#generateTokens({email:userDb.email , username:userDb.username, sub:userDb.id,firstName:userDb.firstName ,lastName:userDb.lastName,imageUrl:userDb.imageUrl,role:userDb.role,recieve_notifications:userDb.recieve_notifications});
                await this.#updateRefreshTokenHash(userDb.id,tokens.refresh_token);
                return tokens;
            }catch(err){
                throw new InternalServerErrorException(err);
            }
    }

    async logout(userId:string):Promise<void>{
         this.userService.findAndUpdate(userId,{refresh_token_hash:null})
    }
    async forgotPassword({email}:ForgotPasswordDTO){
        const userDb = await this.userService.findByEmailWithToken(email);
        if(!userDb){
            throw new NotFoundException("l'utilisateur associe a ce email n'est pas touvee ");
        }
        const token:string =await new Promise((resolve,reject)=>{
            randomBytes(32,(err,buf)=>{
                if(err) reject(err);
                resolve(buf.toString('hex'))
            })
        });
        if(userDb.password_token){
            await this.userService.deleteUserPasswordToken(userDb.password_token.id,userDb.id)
        }
        const hashed_token = await this.#hashPassword(token);
        await this.userService.updateUserPasswordToken(hashed_token,userDb.id)
        await this.#sendEmail(userDb.email,userDb.id,token)

        return "sent"
    
       

    }
    async resetPassword({password,token,userId}:ResetPasswordDTO){
        const userDb = await this.userService.findByIdWithToken(userId)
        if(!userDb){
            throw new NotFoundException("l'utilisateur associe a ce email n'est pas touvee ");
        }
        console.log(userDb)
        const hashed_token = userDb.password_token;
        if(!hashed_token){
            throw new UnauthorizedException("access denied (token absence)");
        }
        const matches = await bcrypt.compare(token,hashed_token.token);
        if(!matches){
            throw new UnauthorizedException("access denied (compare))");
        }

        if( new Date(Date.now()) > hashed_token.expiresIn){
            throw new UnauthorizedException("votre demande de re-initialization a expiré");
        }
        const hashed_password = await this.#hashPassword(password);
        await this.userService.deleteUserPasswordTokenAndUpdatePassword(userDb.password_token.id,userDb.id,hashed_password,userDb.directionId,userDb.departementId,userDb.role)
        return "done";
    }

    async #sendEmail(email:string,userId,token:string){
        let transporter = nodemailer.createTransport({
            service:'Gmail',
            auth: {
              user: this.configService.get('ethereal_user'), // generated ethereal user
              pass: this.configService.get('ethereal_password'), // generated ethereal password
            },
          });


          let info = await transporter.sendMail({
            from: '"bmt" <assoulsidali@gmail.com>', // sender address
            to: email, // list of receivers separated by ,
            subject: "Mot de pasee oublié", // Subject line
            html: `<b>vous avez envoyer une demmande de réinitialisation de mot de passe.</b><br/> presser sur le lien si il s'agit bien de vous </b><br/> le lien:  http://localhost:3000/reset-password?token=${token}&userId=${userId}`, // html body
          });
    }

    async connectedUserResetPassword({actualPassword,password}:ConnectedUserResetPassword,userId:string){
        const connectedUser = await this.userService.getUserPassword(userId);
        if(!connectedUser) throw new BadRequestException("couldn't find user");

        const matches = await this.#comparePassword(actualPassword,connectedUser.password);
        if(!matches) throw new UnauthorizedException("mot de passe icorrect");
        const hashed_password = await this.#hashPassword(password);
        await this.userService.updateUserPassword(userId,hashed_password);

        return 'done';
    }

}