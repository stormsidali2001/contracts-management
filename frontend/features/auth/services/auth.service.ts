import { Jwt } from "../models/Jwt.interface";
import { LoginUser } from "../models/login-user.interface";
import jwt_decode from 'jwt-decode';
import { DecodedJwt } from "../models/decoded-jwt.interface";
import axios from "axios";
import { DisplayUser } from "../models/DisplayUser.interface";
import { UserRole } from "../models/user-role.enum";


const login = async (user:LoginUser):Promise<{user:DisplayUser| null , jwt:Jwt| null} >=>{

            const response = await axios.post(`http://localhost:8080/api/auth/login`, user);
            if(!response.data) return {jwt:null , user:null};
            const tokens:Jwt = response.data;
            console.log('jwt',response.data)
            localStorage.setItem('jwt',JSON.stringify(tokens));
            const decodedJwt:DecodedJwt = jwt_decode(tokens.access_token)
            console.log(1,decodedJwt)
            localStorage.setItem('user',JSON.stringify(decodedJwt.user));

            return {jwt:tokens , user:decodedJwt.user};
}

const logout = async ()=>{
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
}

const verifyAccessToken = async (access_token:string):Promise<{role:UserRole | undefined}>=>{
    
    const response = await axios.get(`http://localhost:8080/api/auth/verify-access-token`,{headers:{
        'Authorization':`Bearer ${access_token}`
    }})
    console.log(response,response.data ,"response")
    return response.data;
   
}

const authService ={
    login,
    logout,
    verifyAccessToken
}


export default authService;