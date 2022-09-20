import { IsEmail ,IsEnum,IsNotEmpty , IsOptional, IsUUID, ValidateIf} from "class-validator";
import { UserRole } from "../types/UserRole.enum";
import { ApiProperty ,ApiPropertyOptional} from "@nestjs/swagger";
export class CreateUserDTO{
    @ApiProperty({required:true, type:'string',example:"assoulsidali@gmail.com"})
    @IsEmail()
    email:string;

    @ApiProperty({required:true, type:'string',example:"sidali.storm"})
    @IsNotEmpty()
    username:string;

    @ApiProperty({required:true, type:'string',example:"Assoul"})
    @IsNotEmpty()
    firstName:string;
    
    @ApiProperty({required:true, type:'string',example:"Sidali"})
    @IsNotEmpty()
    lastName:string;

    @ApiProperty({required:false, type:'string',example:"imagename.extension"})
    @IsNotEmpty()
    imageUrl:string;

    @ApiProperty({required:true, type:'string',example:'123456'})
    @IsNotEmpty()
    password:string;

    @ApiPropertyOptional({type:'enum',enum:UserRole,default:UserRole.EMPLOYEE , example:UserRole.EMPLOYEE})
    @IsOptional()
    @IsEnum(UserRole)
    role:UserRole
    @ApiPropertyOptional({type:'string',example:"44d782ee-ae99-4bca-bce2-1c2fd67e6ece"})
    @IsOptional()
    @IsUUID()
    departementId:string;

    @ApiPropertyOptional({type:'string',example:"4385095c-ed50-4dd4-9748-de7bc11ff467"})
    @IsOptional()
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