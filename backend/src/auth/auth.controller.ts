import { Body, Controller, InternalServerErrorException, Post ,Req,UseGuards , Get, Res} from "@nestjs/common";
import { CreateUserDTO, LoginUserDTO } from "src/core/dtos/user.dto";
import { AuthService } from "./auth.service";
import {ApiTags} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from "./guards/jwt-access-token.guard";
import { UserRole } from "src/core/types/UserRole.enum";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtRefreshTokenGuard } from "./guards/jwt-refresh-token.guard";

@ApiTags('auth')
@Controller("auth")
export class AuthController{
    constructor(
        private authService:AuthService,
        private configService:ConfigService
    ){}
    @Post('register')
    async registerUser(@Body() newUser:CreateUserDTO){
        return await this.authService.register(newUser);
    }   

    @Post("login")
     async login(@Body() user:LoginUserDTO , @Res() res:Response){
     
        const tokens =  await this.authService.login(user);
        res.cookie("refresh_token",tokens.refresh_token,{
            expires:new Date(+this.configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN")),
            httpOnly:true
        })

        return {access_token:tokens.access_token};


       
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get("verify-access-token")
    async verifyAccessToken(@Req() request):Promise<{role:UserRole}>{
        const userId = request.user.id;
        return await this.authService.verifyAccessToken(userId);
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Get("refresh_token")
    async refresh_token(@Req() request , @Res() res){
        const refresh_token = request.refresh_token;
        const userId = request.user.sub;
        const tokens =  await this.authService.refresh_token(userId,refresh_token);
        res.cookie("refresh_token",tokens.refresh_token,{
            expires:new Date(+this.configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN")),
            httpOnly:true
        })

        return {access_token:tokens.access_token};
    }
}