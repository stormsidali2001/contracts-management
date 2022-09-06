import { IsEmail ,IsNotEmpty , ValidateIf} from "class-validator";

export class CreateUserDTO{
    @IsEmail()
    email:string;

    @IsNotEmpty()
    username:string;

    @IsNotEmpty()
    password:string;
}

export class LoginUserDTO{
    @ValidateIf((obj)=>!obj.username) 
    @IsEmail()
    email?:string;

    @ValidateIf((obj)=>!obj.email) 
    @IsNotEmpty()
    username?:string;

    @IsNotEmpty()
    password:string;
}