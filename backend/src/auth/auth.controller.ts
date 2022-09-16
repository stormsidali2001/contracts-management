import { Body, Controller, InternalServerErrorException, Post ,Req,UseGuards , Get} from "@nestjs/common";
import { CreateUserDTO, LoginUserDTO } from "src/core/dtos/user.dto";
import { AuthService } from "./auth.service";
import {ApiTags} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from "./guards/jwt-access-token.guard";
import { UserRole } from "src/core/types/UserRole.enum";

@ApiTags('auth')
@Controller("auth")
export class AuthController{
    constructor(
        private authService:AuthService
    ){}
    @Post('register')
    async registerUser(@Body() newUser:CreateUserDTO){
        return await this.authService.register(newUser);
    }   

    @Post("login")
     async login(@Body() user:LoginUserDTO){
        try{

            return await this.authService.login(user)
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get("verify-access-token")
    async verifyAccessToken(@Req() request):Promise<{role:UserRole}>{
        const userId = request.user.id;
        return await this.authService.verifyAccessToken(userId);
    }
}