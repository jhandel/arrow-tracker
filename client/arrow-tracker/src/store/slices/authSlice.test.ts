import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserInfo,
  AuthState,
} from './authSlice';
import { AccountInfo } from '@azure/msal-browser';

describe('authSlice reducer', () => {
  const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle loginStart', () => {
    const actual = authReducer(initialState, loginStart());
    expect(actual.loading).toBe(true);
    expect(actual.error).toBe(null);
  });

  it('should handle loginSuccess', () => {
    const mockUser: AccountInfo = {
      homeAccountId: 'home-account-id',
      localAccountId: 'local-account-id',
      environment: 'environment',
      tenantId: 'tenant-id',
      username: 'user@example.com',
      name: 'Test User',
    };

    const actual = authReducer(
      { ...initialState, loading: true },
      loginSuccess(mockUser)
    );

    expect(actual.isAuthenticated).toBe(true);
    expect(actual.user).toEqual(mockUser);
    expect(actual.loading).toBe(false);
    expect(actual.error).toBe(null);
  });

  it('should handle loginFailure', () => {
    const errorMessage = 'Authentication failed';
    const actual = authReducer(
      { ...initialState, loading: true },
      loginFailure(errorMessage)
    );

    expect(actual.isAuthenticated).toBe(false);
    expect(actual.loading).toBe(false);
    expect(actual.error).toBe(errorMessage);
  });

  it('should handle logout', () => {
    const loggedInState: AuthState = {
      isAuthenticated: true,
      user: {
        homeAccountId: 'home-account-id',
        localAccountId: 'local-account-id',
        environment: 'environment',
        tenantId: 'tenant-id',
        username: 'user@example.com',
        name: 'Test User',
      },
      loading: false,
      error: null,
    };

    const actual = authReducer(loggedInState, logout());

    expect(actual.isAuthenticated).toBe(false);
    expect(actual.user).toBe(null);
    expect(actual.error).toBe(null);
  });

  it('should handle updateUserInfo', () => {
    const loggedInState: AuthState = {
      isAuthenticated: true,
      user: {
        homeAccountId: 'home-account-id',
        localAccountId: 'local-account-id',
        environment: 'environment',
        tenantId: 'tenant-id',
        username: 'user@example.com',
        name: 'Test User',
      },
      loading: false,
      error: null,
    };

    const updatedInfo = {
      name: 'Updated User',
    };

    const actual = authReducer(loggedInState, updateUserInfo(updatedInfo));

    expect(actual.user).toEqual({
      ...loggedInState.user,
      ...updatedInfo,
    });
  });
});