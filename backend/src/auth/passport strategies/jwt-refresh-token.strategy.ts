import {Injectable, UnauthorizedException} from '@nestjs/common';
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
                const refresh_token = request.cookies['refresh_token'];
                return refresh_token;
            },
            ignoreExpiration:false,
        })
    }
    validate({user}:{user:JwtPayload},request:Request){
        const refresh_token = request.cookies['refresh_token'];
        if(!refresh_token){
            throw new UnauthorizedException("Unauthorized")
            
        }
        return {...user,refresh_token};
    }
}