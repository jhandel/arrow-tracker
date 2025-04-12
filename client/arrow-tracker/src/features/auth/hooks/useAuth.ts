import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMsal, useAccount } from '@azure/msal-react';
import { InteractionStatus, AccountInfo, SilentRequest } from '@azure/msal-browser';
import { loginSuccess, logout } from '../../../store/slices/authSlice';
import { RootState } from '../../../store';
import { loginRequest } from '../config/authConfig';

/**
 * Custom hook for authentication operations
 * Combines MSAL with Redux for state management
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || {});
  const authState = useSelector((state: RootState) => state.auth);

  // Sync MSAL account with Redux store
  useEffect(() => {
    const syncAuth = async () => {
      if (account && !authState.isAuthenticated) {
        // User is authenticated in MSAL but not in Redux
        dispatch(loginSuccess(account));
      } else if (!account && authState.isAuthenticated) {
        // User is not authenticated in MSAL but is in Redux
        dispatch(logout());
      }
    };

    if (inProgress === InteractionStatus.None) {
      syncAuth();
    }
  }, [account, authState.isAuthenticated, dispatch, inProgress]);

  // Login function
  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Logout function
  const signOut = async () => {
    try {
      await instance.logoutRedirect();
      dispatch(logout());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get access token silently
  const getAccessToken = async (): Promise<string | null> => {
    if (!account) {
      return null;
    }

    try {
      const silentRequest: SilentRequest = {
        scopes: loginRequest.scopes,
        account: account as AccountInfo,
      };

      const response = await instance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently, redirecting to login:', error);
      await instance.acquireTokenRedirect(loginRequest);
      return null;
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: inProgress !== InteractionStatus.None || authState.loading,
    error: authState.error,
    login,
    signOut,
    getAccessToken,
  };
};