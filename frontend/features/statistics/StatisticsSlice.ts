import { createSlice } from "@reduxjs/toolkit";
import { AgreementStatus } from "./models/AgreementStats.interface";
import { TopDirections } from "./models/AgreementsTopDirections.interface";
import { AgreementTypes } from "./models/AgreementTypes.interface";
import { UserTypes } from "./models/UserTypes.interface";
import { VendorStats } from "./models/VendorStats.interface";

interface AsyncState{
    isSuccess:boolean;
    isError:boolean;
    isLoading:boolean;
}

interface StatisticsSlice extends AsyncState{
   agreementsStats:{
        status:AgreementStatus ,
        topDirections:TopDirections ,
        types:AgreementTypes
   } | null,
   userTypes:UserTypes | null,
   vendorStats:VendorStats | null
}

const initialState:StatisticsSlice = {
    isError:false,
    isLoading:false,
    isSuccess:false,
    agreementsStats:null,
    userTypes:null,
    vendorStats:null
    
}

const StatisticsSlice = createSlice(
    {
        name:"StatisticsSlice",
        initialState,
        reducers:{

        }
    }
)

export const actions = StatisticsSlice.actions;

export default StatisticsSlice;