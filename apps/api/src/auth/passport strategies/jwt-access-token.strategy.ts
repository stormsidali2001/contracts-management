import {Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/JwtPayload.interface';
@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy,'jwt-access-token'){
    constructor(configService:ConfigService){
        super({
            secretOrKey:configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
        })
    }

    validate({user}:{user:JwtPayload}){
        return user;
    }
}