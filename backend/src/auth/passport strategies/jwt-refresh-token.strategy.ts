import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/JwtPayload.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy,'jwt-refresh-token'){
    constructor(configService:ConfigService){
        super({
            secretOrKey:configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            jwtFromRequest:(request:Request)=>{
                Logger.warn(request.cookies,"debuuuuuuuuug1")
                const refresh_token = request.cookies['refresh_token'];
                Logger.warn("cookie"+request.cookies['refresh_token'],"debbbb")
                if(!refresh_token){
                    throw new UnauthorizedException("Unauthorized")
                    
                }
                return refresh_token;
            },
            ignoreExpiration:false,
        })
    }
    validate({user}:{user:JwtPayload},request:Request){
        Logger.warn(request.cookies,"debuuuuuuuuug5")

        const refresh_token = request.cookies['refresh_token'];
        if(!refresh_token){
            throw new UnauthorizedException("Unauthorized")
            
        }
        return {...user,refresh_token};
    }
}