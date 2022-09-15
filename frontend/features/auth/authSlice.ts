import { createSlice } from "@reduxjs/toolkit";
import { DisplayUser } from "./models/DisplayUser.interface";
import { Jwt } from "./models/Jwt.interface";

export interface AsyncState{
    isLoading:boolean;
    isSuccess:boolean;
    isError:boolean;
}

export interface AuthState extends AsyncState{
    user?:DisplayUser | null;
    jwt?:Jwt | null;
    isAuthenticated?:boolean;

}

const initialState:AuthState = {
   isLoading:false,
   isSuccess:false,
   isError:false,
   user:null,
   jwt:null,
   isAuthenticated:false
}


export const AuthSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        reset: (state)=>{
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
        }
    },
    extraReducers:(builder)=>{

    }

})