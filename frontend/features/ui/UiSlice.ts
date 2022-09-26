import { AlertColor } from "@mui/material";
import { createSlice } from "@reduxjs/toolkit";

interface UiState{
    message:string;
    open:boolean;
    severty:AlertColor;
}

const initialState:UiState = {
    message:"",
    open:false,
    severty:"error"

}

export const uiSlice = createSlice({
    name:"uiSlice",
    initialState,
    reducers:{
        showSnackbar:(state,action)=>{
            state.open = true;
            state.message = action.payload.message;
            action.payload.severty && (state.severty = action.payload.severty );
        },
        clear:(state)=>{
            state.open = false;
            state.message = "";
            state.severty = "error"
        }
    }
})

export const {showSnackbar,clear} =  uiSlice.actions;