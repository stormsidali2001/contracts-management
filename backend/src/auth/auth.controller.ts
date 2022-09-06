import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDTO } from "src/core/dtos/user.dto";
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
}