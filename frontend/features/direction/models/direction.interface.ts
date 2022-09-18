import { Departement } from "./departement.interface";

export interface Direction{
    id:string;
    title:string;
    abriviation:string;
    departements:Departement[];
}

export interface DisplayDirection{
    title:string;
    abriviation:string;
}