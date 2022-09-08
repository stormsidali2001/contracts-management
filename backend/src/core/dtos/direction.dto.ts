import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { CreateDepartementDTO } from "./departement.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDirectionDTO{
    @ApiProperty({type:"string",example:"technique"})
    @IsString()
    @IsNotEmpty()
    title:string;

    @ApiProperty({isArray:true,example:[
        {
            "title":"dp1"
        },
        {
            "title":"dp2"
        },
        {
            "title":"dp3"
        }
    ]})
    @IsArray()
    departements:CreateDepartementDTO[];
}
export class updateDirectionDTO{
    @ApiProperty({type:"string",example:"technique"})
    @IsString()
    @IsNotEmpty()
    title:string;
}