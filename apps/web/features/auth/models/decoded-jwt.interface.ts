import { DisplayUser } from "./DisplayUser.interface";

export interface DecodedJwt{
    user:DisplayUser;
    iat:number;
    exp:number;
}