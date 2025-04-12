import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the user profile state
export interface Archer {
  id: string;
  displayName: string;
  email: string;
  skillLevel: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileState {
  archer: Archer | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: ProfileState = {
  archer: null,
  loading: false,
  error: null
};

// Create the profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess(state, action: PayloadAction<Archer>) {
      state.archer = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfile(state, action: PayloadAction<Partial<Archer>>) {
      if (state.archer) {
        state.archer = { ...state.archer, ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    clearProfile(state) {
      state.archer = null;
    }
  }
});

// Export actions and reducer
export const { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, updateProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;