import { LoginUser } from "../models/login-user.interface";
import jwt_decode from 'jwt-decode';
import { DecodedJwt } from "../models/decoded-jwt.interface";
import axios from "axios";
import { DisplayUser } from "../models/DisplayUser.interface";


const login = async (user:LoginUser):Promise<{user:DisplayUser| null , jwt:string| null} >=>{

            const response = await axios.post(`http://localhost:8080/api/auth/login`, user);
            if(!response.data) return {jwt:null , user:null};
            const access_token =   response.data?.access_token;
            const decodedJwt:DecodedJwt = jwt_decode(access_token);
            return {jwt:access_token , user:decodedJwt.user};
}

const logout = async ()=>{
}

const refresh = async ()=>{
   
        const response = await axios.get('http://localhost:8080/api/auth/refresh_token')
        if(!response.data) return {jwt:null , user:null}
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