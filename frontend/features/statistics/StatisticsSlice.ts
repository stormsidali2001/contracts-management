import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AgreementStatus } from "./models/AgreementStats.interface";
import { TopDirections } from "./models/AgreementsTopDirections.interface";
import { AgreementTypes } from "./models/AgreementTypes.interface";
import { UserTypes } from "./models/UserTypes.interface";
import { VendorStats } from "./models/VendorStats.interface";
import statisticsService from "./services/stats.service";
import {AxiosInstance} from 'axios'
import { UserRole } from "../auth/models/user-role.enum";
import { Entity } from "../notification/models/Entity.enum";
import { Operation } from "../notification/models/Operation.enum";
import { Dayjs } from "dayjs";

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
   vendorsStats:VendorStats | null,
   start_date:Dayjs | null,
   end_date:Dayjs| null,
}

const initialState:StatisticsSlice = {
    isError:false,
    isLoading:false,
    isSuccess:false,
    agreementsStats:null,
    userTypes:null,
    vendorsStats:null,
    start_date:null,
    end_date:null
    
}

export const getStatistics = createAsyncThunk(
    'StatisticsSlice/getStatistics',
    async({axiosInstance}:{axiosInstance:AxiosInstance},thunkAPI)=>{
        return await statisticsService.getStatistics({axiosInstance});
    }
)
export const getStatisticsIntervall = createAsyncThunk(
    'StatisticsSlice/getStatisticsIntervall',
    async({axiosInstance}:{axiosInstance:AxiosInstance},thunkAPI)=>{
        return await statisticsService.getStatistics({axiosInstance});
    }
)
const format = (d:Date)=>{
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g,"");

}

const StatisticsSlice = createSlice(
    {
        name:"StatisticsSlice",
        initialState,
        reducers:{
            newCreatedUserEvent:(state,action:PayloadAction<{type:Entity,operation:Operation}>)=>{
                const value  =   action.payload.type.toLocaleLowerCase() as ("admin" |"employee" | "juridical")
                if(state.userTypes){
                    if(action.payload.operation === Operation.DELETE){
                        if(state.userTypes[value] > 0 ) state.userTypes[value] -= 1;
                        if(state.userTypes.total > 0 ) state.userTypes.total -= 1;

                    }else if(action.payload.operation === Operation.INSERT){
                        
                        state.userTypes[value] += 1;
                        state.userTypes.total += 1;
                    }
                }
            },
            newVendorStats:(state,action:PayloadAction<{vendorsStats:VendorStats}>)=>{
                state.vendorsStats = action.payload.vendorsStats;
            }
           
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

export const {newCreatedUserEvent,newVendorStats} = StatisticsSlice.actions;

export default StatisticsSlice;