import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/authSlice";
import { uiSlice } from "./features/ui/UiSlice";

export const store = configureStore({
    reducer:{
       [authSlice.name]:authSlice.reducer,
       [uiSlice.name]:uiSlice.reducer,
    }
})

export type RootState = ReturnType< typeof store.getState >;
export type AppDispatch =typeof store.dispatch;
export type AppStore = typeof store;

