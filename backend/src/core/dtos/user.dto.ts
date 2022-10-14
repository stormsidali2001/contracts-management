import { IsEmail ,IsEnum,IsNotEmpty , IsOptional, IsString, IsUUID, ValidateIf} from "class-validator";
import { UserRole } from "../types/UserRole.enum";
import { ApiProperty ,ApiPropertyOptional} from "@nestjs/swagger";
export class CreateUserDTO{
    @ApiProperty({required:true, type:'string',example:"assoulsidali@gmail.com"})
    @IsEmail()
    email:string;

    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:"sidali.storm"})
    @IsNotEmpty()
    username:string;

    @ApiProperty({required:true, type:'string',example:"Assoul"})
    @IsNotEmpty()
    firstName:string;
    
    @ApiProperty({required:true, type:'string',example:"Sidali"})
    @IsNotEmpty()
    lastName:string;

    @IsOptional()
    @ApiProperty({required:false, type:'string',example:"imagename.extension"})
    @IsString()
    imageUrl:string;

    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:'123456'})
    @IsNotEmpty()
    password:string;

    @ApiPropertyOptional({type:'enum',enum:UserRole,default:UserRole.EMPLOYEE , example:UserRole.EMPLOYEE})
    @IsOptional()
    @IsEnum(UserRole)
    role:UserRole

    @ApiProperty({type:'string',example:"44d782ee-ae99-4bca-bce2-1c2fd67e6ece"})
    @IsUUID()
    departementId:string;

    @ApiProperty({type:'string',example:"4385095c-ed50-4dd4-9748-de7bc11ff467"})
    @IsUUID()
    directionId:string;
}

export class LoginUserDTO{
    @ApiProperty({type:'string',example:'assoulsidali@gmail.com'})
    @ValidateIf((obj)=>!obj.username) 
    @IsEmail()
    email?:string;

    @ApiProperty({type:'string',example:'strom.sidali'})
    @ValidateIf((obj)=>!obj.email) 
    @IsNotEmpty()
    username?:string;

    @ApiProperty({type:'string',example:'123456'})
    @IsNotEmpty()
    password:string;
}

export class UpdateUserDTO{
    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:"assoulsidali@gmail.com"})
    @IsEmail()
    email?:string;

    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:"sidali.storm"})
    @IsNotEmpty()
    username:string;

    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:"Assoul"})
    @IsNotEmpty()
    firstName:string;

    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:"Sidali"})
    @IsNotEmpty()
    lastName:string;

    @IsOptional()
    @ApiPropertyOptional({ type:'string',example:'123456'})
    @IsNotEmpty()
    password:string;

    @ApiPropertyOptional({type:'enum',enum:UserRole,default:UserRole.EMPLOYEE , example:UserRole.EMPLOYEE})
    @IsOptional()
    @IsEnum(UserRole)
    role:UserRole

    
    @ApiPropertyOptional({type:'boolean',example:true})
    @IsOptional()
    active:boolean;    

   
}


export class ForgotPasswordDTO{
    @ApiProperty({example:"assoulsidali@gmail.com"})
    @IsEmail()
    email:string;

}

export class ResetPasswordDTO{

    @ApiProperty({example:"123456"})
    @IsNotEmpty()
    password:string;

    
    @ApiProperty({example:"token"})
    @IsNotEmpty()
    token:string;

    @ApiProperty({example:"userId"})
    @IsUUID()
    userId:string;
}