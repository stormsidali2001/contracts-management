import { IsArray, IsDateString, IsMobilePhone, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty ,ApiPropertyOptional} from "@nestjs/swagger";
export class CreateVendorDTO{

    @ApiProperty({type:'string',example:'safkjasfjs54'})
    @IsNotEmpty()
    @IsString()
    num:string;

    @ApiProperty({type:'string',example:'frigo dz'})
    @IsNotEmpty()
    @IsString()
    company_name:string;
    

    @ApiProperty({type:'string',example:'safkjfs577'})
    @IsNotEmpty()
    @IsString()
    nif:string;

    @ApiProperty({type:'string',example:'safkjfs577'})
    @IsNotEmpty()
    @IsString()
    nrc:string;

    @ApiProperty({type:'string',example:'contry state city street'})
    @IsNotEmpty()
    @IsString()
    address:string;

    @ApiProperty({type:'string',example:'0663737507'})
    mobile_phone_number:string;

    @ApiProperty({type:'string',example:'0363737507'})
    home_phone_number:string;

    @ApiPropertyOptional({  example:"2023-01-05"})
    @IsDateString({strict:true})
    createdAt:Date;

   
}

export class UpdateVendorDTO{

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'safkjasfjs54'})
    @IsNotEmpty()
    @IsString()
    num:string;

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'frigo dz'})
    @IsNotEmpty()
    @IsString()
    company_name:string;

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'safkjfs577'})
    @IsNotEmpty()
    @IsString()
    nif:string;

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'safkjfs577'})
    @IsNotEmpty()
    @IsString()
    nrc:string;

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'contry state city street'})
    @IsNotEmpty()
    @IsString()
    address:string;

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'0663737507'})
    @IsNotEmpty()
    mobile_phone_number:string;

    @IsOptional()
    @ApiPropertyOptional({type:'string',example:'0663737507'})
    @IsNotEmpty()
    home_phone_number:string;
   
}