import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountInfo } from '@azure/msal-browser';

// Define the authentication state interfaces
export interface AuthState {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Create the authentication slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<AccountInfo>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    updateUserInfo(state, action: PayloadAction<Partial<AccountInfo>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

// Export actions and reducer
export const { loginStart, loginSuccess, loginFailure, logout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;