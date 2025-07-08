import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import selectionReducer from "./selectionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
