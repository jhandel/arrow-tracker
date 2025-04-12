import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ThemeProvider from '../shared/components/ThemeProvider';

// Import reducers
import authReducer from '../store/slices/authSlice';
import profileReducer from '../store/slices/profileSlice';

// Create a custom renderer that includes Redux provider and theme
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a test store with all reducers
  const store = configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      // Add other reducers as they are created
    },
    // Preloaded state can be set here for specific test cases
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      },
      profile: {
        archer: null,
        loading: false,
        error: null,
      },
    },
  });

  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

// Custom render method that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper function to mock authenticated state
export const mockAuthenticatedState = (store: any) => {
  store.getState().auth = {
    isAuthenticated: true,
    user: {
      localAccountId: 'test-user-id',
      username: 'test@example.com',
      name: 'Test User',
      idTokenClaims: {
        given_name: 'Test',
        family_name: 'User',
      },
    },
    loading: false,
    error: null,
  };
};

// Helper function to mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};