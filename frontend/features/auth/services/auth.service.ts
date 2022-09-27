import { LoginUser } from "../models/login-user.interface";
import jwt_decode from 'jwt-decode';
import { DecodedJwt } from "../models/decoded-jwt.interface";
import { DisplayUser } from "../models/DisplayUser.interface";
import axios, { axiosPrivate } from "../../../api/axios";


const login = async (user:LoginUser):Promise<{user:DisplayUser| null , jwt:string| null} >=>{

            const response = await axiosPrivate.post(`/auth/login`, user);
            const access_token =   response.data?.access_token;
            const decodedJwt:DecodedJwt = jwt_decode(access_token);
            return {jwt:access_token , user:decodedJwt.user};
}

const logout = async ()=>{
    await axiosPrivate.post("auth/logout");
}

const refresh = async ()=>{
   
        const response = await axiosPrivate.get('/auth/refresh_token')
        const access_token =   response.data?.access_token;
        const decodedJwt:DecodedJwt = jwt_decode(access_token);
        return {jwt:access_token , user:decodedJwt.user};
  
}

const authService ={
    login,
    logout,
    refresh
}


export default authService;