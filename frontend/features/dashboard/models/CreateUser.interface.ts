export interface CreateUser{
    email:string
    password?:string;
    username?:string;
    firstName:string;
    lastName:string;
    role:string;
    imageUrl?:string;
    directionId:string |null;
    departementId:string| null;
}