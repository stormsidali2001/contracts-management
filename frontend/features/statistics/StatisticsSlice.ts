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
            newCreatedVendorEvent:(state,action:PayloadAction<{date:Date,operation:Operation}>)=>{
                if(!state.vendorsStats) return;
                const index = state.vendorsStats.findIndex(v=>{

                    v.date === action.payload.date

                    const a_d = v.date;
                    const b_d = action.payload.date;
                    a_d.setHours(0,0,0,0)
                    b_d.setHours(0,0,0,0)

                    return Number(a_d) === Number(b_d);
                })
                // if(index > 0){
                    
                //     if(action.payload.operation === Operation.DELETE){
                //         state.vendorsStats[index].nb_vendors -= 1;
                //     }else if(action.payload.operation === Operation.INSERT){
                //         state.vendorsStats[index].nb_vendors += 1;
                //     }
                    
                // }else{
                //     state.vendorsStats.unshift({date:action.payload.date,nb_vendors:1,id:new Date().toString()})
                //     state.vendorsStats = state.vendorsStats.sort((a,b)=>{
                //         const a_d = a.date;
                //         const b_d = b.date;
                //         a_d.setHours(0,0,0,0)
                //         b_d.setHours(0,0,0,0)
                //        return  Number(b_d) - Number(a_d)
                //     })
                // }
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

export const {newCreatedUserEvent,newCreatedVendorEvent} = StatisticsSlice.actions;

export default StatisticsSlice;