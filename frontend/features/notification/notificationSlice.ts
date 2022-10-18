import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "./models/Notification.interface";
import { UserEvent } from "./models/UserEvent.interface";



interface AsyncState{
    isEstablishingConnection:boolean;
    isConnected:boolean;
}
interface NotificationState extends AsyncState{
    notifications:Notification[],
    isEstablishingConnection:boolean,
    isConnected:boolean,
    events:UserEvent[]
}

export const initialState:NotificationState = {
    notifications:[],
    isEstablishingConnection:false,
    isConnected:false,
    events:[]

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
            state.notifications.unshift(action.payload.notification);
        },
        recieveNotifications:(state,action:PayloadAction<{notifications:Notification[]}>)=>{
            state.notifications = action.payload.notifications;
        },
        recieveUserEvents(state,action:PayloadAction<{events:UserEvent[]}>){
            state.events = action.payload.events;
        },
        recieveUserEvent(state,action:PayloadAction<{event:UserEvent}>){
            state.events.unshift(action.payload.event)
        }
    }
})




export const {
    startConnecting,
    connectionEstablished,
    recieveNotification,
    recieveNotifications,
    recieveUserEvents,
    recieveUserEvent
} = notificationSlice.actions;