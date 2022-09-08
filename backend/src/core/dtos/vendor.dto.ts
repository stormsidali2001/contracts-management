import { IsArray, IsMobilePhone, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";
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
    @IsPhoneNumber('AL')
    mobile_phone_number:string;

    @ApiProperty({type:'string',example:'0663737507'})
    @IsPhoneNumber('AL')
    home_phone_number:string;

    @ApiPropertyOptional({isArray:true,example:["",""]})
    @IsOptional()
    @IsArray()
    @IsUUID('all',{each:true})
    agreementIds:string[];
}