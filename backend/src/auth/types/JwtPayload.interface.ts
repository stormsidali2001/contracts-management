import { Socket } from "socket.io";
export interface JwtPayload{
    sub:string;
    email:string;
    username:string;
    firstName:string;
    lastName:string;
    imageUrl?:string;

}
export interface JwtCompletePayload  {
    user:JwtPayload;
    exp:number;
    iat:number;
};

export type SocketWithJwtPayload = Socket & JwtCompletePayload;