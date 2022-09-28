import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "./models/Notification.interface";



interface AsyncState{
    isEstablishingConnection:boolean;
    isConnected:boolean;
}
interface NotificationState extends AsyncState{
    notifications:Notification[],
    isEstablishingConnection:boolean,
    isConnected:boolean
}

export const initialState:NotificationState = {
    notifications:[],
    isEstablishingConnection:false,
    isConnected:false,
}


export const notificationSlice = createSlice({
    name:"notification",
    initialState,
    reducers:{
        startConnecting:(state)=>{
            state.isEstablishingConnection = true
        },
        connectionEstablished:(state)=>{
            state.isConnected = true;
            state.isEstablishingConnection = false;
        },
        recieveNotification:(state,action:PayloadAction<{notification:Notification}>)=>{
            state.notifications.push(action.payload.notification);
        },
        recieveNotifications:(state,action:PayloadAction<{notifications:Notification[]}>)=>{
            state.notifications = action.payload.notifications;
        },
    }
})




export const {startConnecting,connectionEstablished,recieveNotification,recieveNotifications} = notificationSlice.actions;