import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError, AxiosInstance } from "axios";
import { RootState } from "../../store";
import { startConnecting } from "../notification/notificationSlice";
import { DisplayUser } from "./models/DisplayUser.interface";
import { LoginUser } from "./models/login-user.interface";
import authService from "./services/auth.service";


export interface AsyncState{
    isLoading:boolean;
    isSuccess:boolean;
    isError:boolean;
    error:string| null;
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
   isAuthenticated:false,
   error:null
}

export const login = createAsyncThunk(
    'auth/login',
    async (user:LoginUser,thunkAPI)=>{
        try{
            return await authService.login(user);
        }catch(err){
            console.log("t71",err);
            //@ts-ignore
            return thunkAPI.rejectWithValue(err?.response?.data?.error ?? "error inconnu");
        }
    }
)
export const forgotPassword = createAsyncThunk(
    'auth/forgot-password',
    async (email:string,thunkAPI)=>{
        try{
            return await authService.forgotPassword(email);
        }catch(err){
            return thunkAPI.rejectWithValue("failed to reset password");
        }
    }
)

export const resetPassword = createAsyncThunk(
    'auth/reset-password',
    async ({password,userId,token}:{password:string,userId:string,token:string},thunkAPI)=>{
        try{
            return await authService.resetPassword({password,token,userId});
        }catch(err){
            return thunkAPI.rejectWithValue("failed to reset password");
        }
    }
)

export const refresh_token = createAsyncThunk(
    'auth/refresh_token',
    async (_,thunkAPI)=>{
        try{
            const res =    await authService.refresh();
           return res;
        }catch(err){
            console.log(err);
            return  thunkAPI.rejectWithValue("invalide or expired access token")
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async ({axios_instance}:{axios_instance:AxiosInstance},thunkAPI)=>{
        try{
            return await authService.logout({axios_instance});
        }catch(err){
           
            return  err;
        }
    }
)

export const selectRecieveNotifications = createAsyncThunk(
    'auth/selectRecieveNotification',
    async (params:{axios_instance:AxiosInstance},thunkAPI)=>{
        try{
            return await authService.selectRecieveNotification(params)
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
        setCredentials:(state,action)=>{
            state.user = action.payload.user;
            state.jwt = action.payload.jwt;
        },
        setImageUrl:(state,action)=>{
            if(!state.user) return;
            state.user.imageUrl = action.payload.imageUrl
        }
      
    },
    extraReducers:(builder)=>{
        builder
        //login
        .addCase(login.pending,(state)=>{
            state.isLoading = true;
            state.isSuccess = false;
            state.isError = false
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.user = action.payload?.user;
            state.jwt = action.payload?.jwt;
            state.isSuccess = true;
            state.isLoading = false;
            state.isAuthenticated = true;
            state.isError = false

        })
        .addCase(login.rejected,(state,action)=>{
            console.log("t72",action)
            state.isLoading = false;
            state.isError = true;
            state.user = null;
            state.isAuthenticated = false;
            state.error = action.payload as unknown as string | null;
           
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
        .addCase(refresh_token.rejected,(state,action)=>{
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

        //forgot password
        .addCase(forgotPassword.fulfilled,(state)=>{
            state.isSuccess = true;
            state.isLoading = false;
            state.isError = false;
        })
        .addCase(forgotPassword.pending,(state)=>{
            state.isSuccess = false;
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(forgotPassword.rejected,(state)=>{
            state.isSuccess = false;
            state.isLoading = false;
            state.isError = true;
        })

        //reset password
        .addCase(resetPassword.fulfilled,(state)=>{
            state.isSuccess = true;
            state.isLoading = false;
            state.isError = false;
        })
        .addCase(resetPassword.pending,(state)=>{
            state.isSuccess = false;
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(resetPassword.rejected,(state)=>{
            state.isSuccess = false;
            state.isLoading = false;
            state.isError = true;
        })

        //selectRecieveNotifications
        .addCase(selectRecieveNotifications.fulfilled,(state,action)=>{
            state.isSuccess = true;
            state.isLoading = false;
            state.isError = false;
            if(state.user) state.user.recieve_notifications = !state.user.recieve_notifications

        })
        .addCase(selectRecieveNotifications.pending,(state)=>{
            state.isSuccess = false;
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(selectRecieveNotifications.rejected,(state)=>{
            state.isSuccess = false;
            state.isLoading = false;
            state.isError = true;
        })


    }

})

export const selectedUser = (state:RootState)=>state.auth;
export const {reset,setCredentials,setImageUrl} = authSlice.actions;