import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import slices here as they are created
import authReducer from './slices/authSlice';
// import practiceReducer from './slices/practiceSlice';
// import equipmentReducer from './slices/equipmentSlice';
import profileReducer from './slices/profileSlice';

// Configure persist options
const persistConfig = {
  key: 'root',
  storage,
  // Whitelist specific reducers for persistence
  whitelist: ['auth', 'practice', 'equipment', 'profile'],
};

// Create the root reducer with all slice reducers
const rootReducer = combineReducers({
  // Add reducers as they are implemented
  auth: authReducer,
  // practice: practiceReducer,
  // equipment: equipmentReducer,
  profile: profileReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;