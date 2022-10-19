import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AgreementStatus } from "./models/AgreementStats.interface";
import { TopDirections } from "./models/AgreementsTopDirections.interface";
import { AgreementTypes } from "./models/AgreementTypes.interface";
import { UserTypes } from "./models/UserTypes.interface";
import { VendorStats } from "./models/VendorStats.interface";
import statisticsService from "./services/stats.service";
import {AxiosInstance} from 'axios'

interface AsyncState{
    isSuccess:boolean;
    isError:boolean;
    isLoading:boolean;
}

export interface StatisticsSlice extends AsyncState{
   agreementsStats:{
        status:AgreementStatus ,
        topDirections:TopDirections ,
        types:AgreementTypes
   } | null,
   userTypes:UserTypes | null,
   vendorsStats:VendorStats | null
}

const initialState:StatisticsSlice = {
    isError:false,
    isLoading:false,
    isSuccess:false,
    agreementsStats:null,
    userTypes:null,
    vendorsStats:null
    
}

export const getStatistics = createAsyncThunk(
    'StatisticsSlice/getStatistics',
    async({axiosInstance}:{axiosInstance:AxiosInstance},thunkAPI)=>{
        return await statisticsService.getStatistics({axiosInstance})
    }
)
const StatisticsSlice = createSlice(
    {
        name:"StatisticsSlice",
        initialState,
        reducers:{

        },
        extraReducers:(builder)=>{
            builder.addCase(getStatistics.pending,(state,action)=>{
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
            })
            .addCase(getStatistics.rejected,(state,action)=>{
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
            })
            .addCase(getStatistics.fulfilled,(state,action)=>{
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;

                state.userTypes = action.payload.userTypes;
                state.vendorsStats = action.payload.vendorsStats;
                state.agreementsStats = action.payload.agreementsStats;
            })
        }
    }
)

export const actions = StatisticsSlice.actions;

export default StatisticsSlice;