import { LoginUser } from "../models/login-user.interface";
import jwt_decode from 'jwt-decode';
import { DecodedJwt } from "../models/decoded-jwt.interface";
import { DisplayUser } from "../models/DisplayUser.interface";
import axios, { axiosPrivate } from "../../../api/axios";
import { AxiosInstance } from "axios";


const login = async (user:LoginUser):Promise<{user:DisplayUser| null , jwt:string| null} >=>{

            try{
                const response = await axiosPrivate.post(`/auth/login`, user);
                const access_token =   response.data?.access_token;
                const decodedJwt:DecodedJwt = jwt_decode(access_token);
                return {jwt:access_token , user:decodedJwt.user};

            }catch(err){
                throw err;
            }
           
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
const forgotPassword = async (email:string)=>{
    await  axiosPrivate.post('/auth/forgot-password',{email});
}

const resetPassword = async ({password,userId,token}:{password:string,userId:string,token:string})=>{
    await  axiosPrivate.post('/auth/reset-password',{password,userId,token});
}

const selectRecieveNotification = async ({axios_instance}:{axios_instance:AxiosInstance})=>{
    const res =  await axios_instance.patch("/users/recieve-notifications")
    if(!res?.data) throw new Error();
    return res?.data;
}

const authService ={
    login,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
    selectRecieveNotification
}


export default authService;