import { Body, Controller, InternalServerErrorException, Post ,Req,UseGuards , Get, Res, Logger} from "@nestjs/common";
import { CreateUserDTO, LoginUserDTO } from "src/core/dtos/user.dto";
import { AuthService } from "./auth.service";
import {ApiTags} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from "./guards/jwt-access-token.guard";
import { UserRole } from "src/core/types/UserRole.enum";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtRefreshTokenGuard } from "./guards/jwt-refresh-token.guard";
import { CurrentUserId } from "./decorators/currentUserId.decorator";

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
     async login(@Body() user:LoginUserDTO , @Res({passthrough:true}) res:Response){
     
        const tokens =  await this.authService.login(user);
        Logger.warn(`refresh_token: ${tokens.refresh_token}`)
        res.cookie("refresh_token",tokens.refresh_token,{
            maxAge:+this.configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN"),
            // httpOnly:true,
            sameSite: 'strict',
            secure:false
        })
        console.log("returning the token")
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
    async refresh_token(@Req() request , @Res({passthrough:true}) res){
        const refresh_token = request.user.refresh_token;
        const userId = request.user.sub;
        const tokens =  await this.authService.refresh_token(userId,refresh_token);
        res.cookie("refresh_token",tokens.refresh_token,{
            maxAge:new Date(+this.configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN")),
            // httpOnly:true,
            sameSite: 'strict',
        })

        return {access_token:tokens.access_token} ;
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post('logout')
    async logout(@CurrentUserId() id:string){
        await this.authService.logout(id);
        return "done"
    }

}