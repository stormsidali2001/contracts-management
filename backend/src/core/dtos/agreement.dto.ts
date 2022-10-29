import { IsArray, IsDate, IsDateString, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, isString, IsString, IsUUID } from "class-validator";
import { AgreementStatus } from "../types/agreement-status.enum";
import { AgreementType } from "../types/agreement-type.enum";
import {ApiProperty ,ApiPropertyOptional} from '@nestjs/swagger'
export class CreateAgreementDTO{
    @ApiProperty({  example:"5454fsa5fs" ,required:true})
    @IsNotEmpty()
    number:string;

    @IsOptional()
    @ApiPropertyOptional({example:AgreementType.CONTRACT , enum:AgreementType , default:AgreementType.CONTRACT})
    @IsEnum(AgreementType)
    type?:AgreementType;

    @ApiProperty({  example:"some object" ,required:true})
    @IsNotEmpty()
    object:string;
    @ApiProperty({  example:6000 ,required:true})
    @IsPositive()
    amount:number;

    @ApiProperty({  example:"2023-01-05" ,required:true})
    @IsDateString({strict:true})
    expiration_date:Date;

    @ApiProperty({  example:"2023-01-05" ,required:true})
    @IsDateString({strict:true})
    signature_date:Date;
    
    @IsOptional()
    @ApiPropertyOptional({example:AgreementStatus.NOT_EXECUTED , enum:AgreementStatus , default:AgreementStatus.NOT_EXECUTED})
    @IsEnum(AgreementStatus)
    status:AgreementStatus;

    @ApiProperty({  example:"asff/ss" ,required:true})
    @IsString()
    url:string;

    @ApiProperty({  example:"" ,required:true})
    @IsUUID()
    directionId:string;

    @ApiProperty({  example:"" ,required:true})
    @IsUUID()
    departementId:string;

    @ApiProperty({  example:"4385095c-ed50-4dd4-9748-de7bc11ff467" ,required:true})
    @IsUUID()
    vendorId:string;

}

export class ExecuteAgreementDTO{
    @ApiProperty({  example:"2023-01-05" ,required:true})
    @IsDateString({strict:true})
    execution_start_date:Date;

    @ApiProperty({  example:"2023-01-05" ,required:true})
    @IsDateString({strict:true})
    execution_end_date:Date;

    @ApiProperty({  example:"" ,required:true})
    @IsUUID()
    agreementId:string;


    @IsOptional()
    @ApiPropertyOptional({  example:"observation..." ,required:true})
    @IsString()
    observation:string;
}




export class FindAllAgreementsDTO{
    @IsOptional()
    offset:number = 0;

    @IsOptional()
    limit:number = 10;

    @ApiProperty({example:AgreementType.CONTRACT , enum:AgreementType , default:AgreementType.CONTRACT})
    @IsEnum(AgreementType)
    agreementType:AgreementType;

    @IsOptional()
    @IsString()
    searchQuery:string;

    @IsOptional()
    @IsString()
    orderBy:string;

    @IsOptional()
    @ApiPropertyOptional({  example:"" })
    @IsUUID()
    directionId:string;

    @IsOptional()
    @ApiPropertyOptional({  example:"" })
    @IsUUID()
    departementId:string;

    @IsOptional()
    @ApiPropertyOptional({  example:0 })
    amount_min:number;

    @IsOptional()
    @ApiPropertyOptional({  example:6000 })
    amount_max:number;

    @IsOptional()
    @ApiPropertyOptional({  example:"2023-01-05" })
    @IsDateString({strict:true})
    start_date:Date;


    @IsOptional()
    @ApiPropertyOptional({  example:"2023-01-05" })
    @IsDateString({strict:true})
    end_date:Date;

    @IsOptional()
    @ApiPropertyOptional({example:AgreementStatus.NOT_EXECUTED , enum:AgreementStatus , default:AgreementStatus.NOT_EXECUTED})
    @IsEnum(AgreementStatus)
    status:AgreementStatus;

    @IsOptional()
    @IsUUID()
    vendorId:string;
}