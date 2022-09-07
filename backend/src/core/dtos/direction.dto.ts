import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { CreateDepartementDTO } from "./departement.dto";

export class CreateDirectionDTO{
    @IsString()
    @IsNotEmpty()
    title:string;

    @IsArray()
    departements:CreateDepartementDTO[];
}