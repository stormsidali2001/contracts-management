import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { DisplayUser } from "./models/DisplayUser.interface";
import { Jwt } from "./models/Jwt.interface";
import { LoginUser } from "./models/login-user.interface";
import authService from "./services/auth.service";

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

export const login = createAsyncThunk(
    'login',
    async (user:LoginUser,thunkAPI)=>{
        try{
            return await authService.login(user);
        }catch(err){
            console.log(err);
            return  thunkAPI.rejectWithValue("unable to sign in ")
        }
    }
)
export const authSlice = createSlice({
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
        builder
        .addCase(login.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.user = action.payload?.user;
            state.jwt = action.payload?.jwt;
            state.isSuccess = true;
            state.isLoading = false;
            state.isAuthenticated = true;
        })
        .addCase(login.rejected,(state)=>{
            state.isLoading = false;
            state.isError = true;
            state.user = null;
            state.isAuthenticated = false;
        })

    }

})

export const selectedUser = (state:RootState)=>state.auth;
export const {reset} = authSlice.actions;