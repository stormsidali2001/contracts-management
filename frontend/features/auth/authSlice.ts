import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { DisplayUser } from "./models/DisplayUser.interface";
import { Jwt } from "./models/Jwt.interface";
import { LoginUser } from "./models/login-user.interface";
import authService from "./services/auth.service";
//getting an item from local storage when the we are in the browser
const getFromLocalStorage = (key:string)=>{
    const itemStr = typeof window !== "undefined" && localStorage.getItem(key) ? 
    localStorage.getItem(key) : null;
    return itemStr && JSON.parse(itemStr);
}

const jwt = getFromLocalStorage("jwt");
const user =   getFromLocalStorage("user");

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
   user,
   jwt,
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
export const verifyAccessToken = createAsyncThunk(
    'auth/verify-access-token',
    async (access_token:string,thunkAPI)=>{
        try{
            console.log("trying with ",access_token)
            const role =  await authService.verifyAccessToken(access_token)
            return role;
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
        }
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
        //verify-access-token
        .addCase(verifyAccessToken.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(verifyAccessToken.fulfilled,(state,action)=>{
            state.isSuccess = true;
            state.isLoading = false;
            state.isAuthenticated = true;
            if(state.user){
                state.user.role = action.payload.role;
            }
            
        })
        .addCase(verifyAccessToken.rejected,(state)=>{
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