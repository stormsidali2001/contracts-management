import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/authSlice";
import notificationMiddleware from "./features/notification/notificationMiddleware";
import { notificationSlice } from "./features/notification/notificationSlice";
import StatisticsSlice from "./features/statistics/StatisticsSlice";
import { uiSlice } from "./features/ui/UiSlice";

export const store = configureStore({
    reducer:{
       [authSlice.name]:authSlice.reducer,
       [uiSlice.name]:uiSlice.reducer,
       [notificationSlice.name]:notificationSlice.reducer,
       [StatisticsSlice.name]:StatisticsSlice.reducer
    },
    middleware:(getDefaultMiddleware )=>{
        return getDefaultMiddleware().concat([notificationMiddleware])
    }
})

export type RootState = ReturnType< typeof store.getState >;
export type AppDispatch =typeof store.dispatch;
export type AppStore = typeof store;

