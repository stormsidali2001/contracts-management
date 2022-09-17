import { Departement } from "./departement.interface";

export interface Direction{
    id:string;
    title:string;
    departements:Departement[];
}