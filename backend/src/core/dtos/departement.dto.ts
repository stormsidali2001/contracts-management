import { IsNotEmpty } from "class-validator";

export class CreateDepartementDTO{

    @IsNotEmpty()
    title:string;
}
export class UpdateDepartementDTO{

    @IsNotEmpty()
    title:string;
}