import { IsArray, IsMobilePhone, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";

export class CreateVendorDTO{

    @IsNotEmpty()
    @IsString()
    num:string;

    @IsNotEmpty()
    @IsString()
    company_name:string;

    @IsNotEmpty()
    @IsString()
    nif:string;

    @IsNotEmpty()
    @IsString()
    nrc:string;

    @IsNotEmpty()
    @IsString()
    address:string;

    @IsPhoneNumber('AL')
    mobile_phone_number:string;

    @IsPhoneNumber('AL')
    home_phone_number:string;

    @IsOptional()
    @IsArray()
    @IsUUID('all',{each:true})
    agreementIds:string[];
}