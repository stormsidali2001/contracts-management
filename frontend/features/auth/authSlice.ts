import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { DisplayUser } from "./models/DisplayUser.interface";
import { LoginUser } from "./models/login-user.interface";
import authService from "./services/auth.service";


export interface AsyncState{
    isLoading:boolean;
    isSuccess:boolean;
    isError:boolean;
}

export interface AuthState extends AsyncState{
    user?:DisplayUser | null;
    jwt?:string | null;
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
    'auth/login',
    async (user:LoginUser,thunkAPI)=>{
        try{
            return await authService.login(user);
        }catch(err){
            console.log(err);
            return  thunkAPI.rejectWithValue("unable to sign in ")
        }
    }
)
export const refresh_token = createAsyncThunk(
    'auth/refresh_token',
    async (_,thunkAPI)=>{
        try{
           return   await authService.refresh();
        }catch(err){
            console.log(err);
            return  thunkAPI.rejectWithValue("invalide or expired access token")
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_,thunkAPI)=>{
        try{
            return await authService.logout();
        }catch(err){
            console.log(err);
            return  thunkAPI.rejectWithValue("unable to logout")
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
        },
      
    },
    extraReducers:(builder)=>{
        builder
        //login
        .addCase(login.pending,(state)=>{
            state.isLoading = true;
            state.isSuccess = false;
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
        //refresh_token
        .addCase(refresh_token.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(refresh_token.fulfilled,(state,action)=>{
            state.isSuccess = true;
            state.isLoading = false;
            state.isAuthenticated = true;
            state.jwt =  action.payload.jwt;
            state.user = action.payload.user;
        })
        .addCase(refresh_token.rejected,(state)=>{
            state.isLoading = false;
            state.isError = true;
            state.isAuthenticated = false;
        })
        //logout
        .addCase(logout.fulfilled,(state)=>{
            state.user = null;
            state.jwt = null;
            state.isAuthenticated = false;
        })

    }

})

export const selectedUser = (state:RootState)=>state.auth;
export const {reset} = authSlice.actions;