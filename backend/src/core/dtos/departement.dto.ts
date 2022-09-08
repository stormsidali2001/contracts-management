import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ApiProperty ,ApiPropertyOptional} from "@nestjs/swagger";

export class CreateDepartementDTO{
    @ApiProperty({type:"string",example:"dp1"})
    @IsString()
    @IsNotEmpty()
    title:string;

    @ApiProperty({type:"string",example:"4385095c-ed50-4dd4-9748-de7bc11ff467"})
    @IsUUID()
    directionId:string;
}
export class UpdateDepartementDTO{
    @ApiProperty({type:"string",example:"dp1"})
    @IsString()
    @IsNotEmpty()
    title:string;
}