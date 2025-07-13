import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../service/UserService";
import type { User } from "../types/UserTypes";
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle", // 'idle' means we haven't checked for a session yet
  error: null,
};

const fetchUser = createAsyncThunk("auth/fetchUser", async (_, thunkAPI) => {
  try {
    const res = await getProfile();
    // This check depends on your API response structure, e.g., { status: true, ... }
    if (!res.status) {
      throw new Error(res.data?.message || "Failed to fetch user profile.");
    }
    return res.data.user;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch user");
  }
});

const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await loginUser(credentials);
      if (!res.status) {
        throw new Error(res.data.message);
      }
      return res.data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const register = createAsyncThunk(
  "auth/register",
  async (
    credentials: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await registerUser(credentials);
      if (!res.status) {
        throw new Error(res.data.message);
      }
      return res.data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const res = await logoutUser();
    if (!res.status) {
      throw new Error(res.data.message);
    }
    return null; // Return null to indicate user is logged out
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        console.log("fetchUser fulfilled", action.payload);
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = "failed";
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
      });
  },
});

export default authSlice.reducer;
export { login, logout, fetchUser,register };
