import { IsArray, IsDate, IsDateString, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";
import { AgreementStatus } from "../types/agreement-status.enum";
import { AgreementType } from "../types/agreement-type.enum";

export class CreateAgreementDTO{
    @IsNotEmpty()
    number:string;

    @IsOptional()
    @IsEnum(AgreementType)
    type:AgreementType;

    @IsNotEmpty()
    object:string;

    @IsPositive()
    amount:number;

    @IsDateString({strict:true})
    expiration_date:Date;

    @IsDateString({strict:true})
    signature_date:Date;
    
    @IsOptional()
    @IsEnum(AgreementStatus)
    status:AgreementStatus;

    @IsString()
    @IsNotEmpty()
    url:string;

    @IsUUID()
    directionId:string;

    @IsUUID()
    departementId:string;

    @IsArray()
    @IsUUID('all',{each:true})
    vendorIds:string[];

}