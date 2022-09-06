import { Body, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { CreateUserDTO, LoginUserDTO } from "src/core/dtos/user.dto";
import { AuthService } from "./auth.service";


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
}