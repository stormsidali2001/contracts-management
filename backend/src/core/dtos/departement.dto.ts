import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateDepartementDTO{

    @IsNotEmpty()
    title:string;
    @IsUUID()
    directionId:string;
}
export class UpdateDepartementDTO{

    @IsNotEmpty()
    title:string;
}