import { IsEmail ,IsEnum,IsNotEmpty , IsOptional, IsUUID, ValidateIf} from "class-validator";
import { UserRole } from "../types/UserRole.enum";

export class CreateUserDTO{
    @IsEmail()
    email:string;

    @IsNotEmpty()
    username:string;

    @IsNotEmpty()
    password:string;

    @IsOptional()
    @IsEnum(UserRole)
    role:UserRole

    @IsOptional()
    @IsUUID()
    departementId:string;

    @IsOptional()
    @IsUUID()
    directionId:string;
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