import { IsDate, IsEnum, IsNotEmpty, IsPositive, IsString, IsUUID } from "class-validator";
import { AgreementStatus } from "../types/agreement-status.enum";
import { AgreementType } from "../types/agreement-type.enum";

export class CreateAgreementDTO{
    @IsNotEmpty()
    number:string;
    @IsEnum(AgreementType)
    type:AgreementType;

    object:string;

    @IsPositive()
    amount:number;

    @IsDate()
    expiration_date:Date;

    @IsDate()
    signature_date:Date;

    @IsEnum(AgreementStatus)
    status:AgreementStatus;

    @IsString()
    @IsNotEmpty()
    url:string;

    @IsUUID()
    directionId:string;

    @IsUUID()
    departementId:string;

    @IsUUID()
    vendorId:string;

}