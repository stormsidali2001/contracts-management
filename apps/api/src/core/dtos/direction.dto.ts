import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { CreateDepartementDTO, DepartementDTO } from "./departement.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDirectionDTO{
    @ApiProperty({type:"string",example:"technique"})
    @IsString()
    @IsNotEmpty()
    title:string;

    @ApiProperty({type:"string",example:"DTQ"})
    @IsString()
    @IsNotEmpty()
    abriviation:string;

    @ApiProperty({isArray:true,example:[
        {
            "title":"departement1",
            "abriviation":"dp1"
        },
        {
            "title":"departement2",
            "abriviation":"dp2"
        },
        {
            "title":"departement3",
            "abriviation":"dp3"
        },
      
    ]})
    @IsArray()
    departements:DepartementDTO[];
}
export class updateDirectionDTO{
    @ApiProperty({type:"string",example:"technique"})
    @IsString()
    @IsNotEmpty()
    title:string;
}