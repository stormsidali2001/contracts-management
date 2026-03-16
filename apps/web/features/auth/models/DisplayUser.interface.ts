import { UserRole } from "./user-role.enum";

export interface DisplayUser{
    sub:string;
    username:string;
    email:string;
    firstName:string;
    lastName:string;
    role?:UserRole;
    imageUrl?:string;
    recieve_notifications:boolean;
}