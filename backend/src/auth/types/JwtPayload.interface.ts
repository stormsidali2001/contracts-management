
export interface JwtPayload{
    sub:string;
    email:string;
    username:string;
    firstName:string;
    lastName:string;

}
export interface JwtCompletePayload  {
    user:JwtPayload;
    exp:number;
    iat:number;
};