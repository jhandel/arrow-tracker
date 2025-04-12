import { Configuration, LogLevel } from '@azure/msal-browser';

// Azure AD B2C configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || 'placeholder-client-id',
    authority: `https://${process.env.REACT_APP_AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.REACT_APP_AZURE_B2C_POLICY_NAME}`,
    knownAuthorities: [`${process.env.REACT_APP_AZURE_B2C_TENANT_NAME}.b2clogin.com`],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: process.env.NODE_ENV === 'development' ? LogLevel.Verbose : LogLevel.Warning,
    },
  },
};

// Scopes for API access
export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access', 'https://arrowtracker.onmicrosoft.com/api/user.read'],
};

// Constants for authentication policies
export const authenticationConstants = {
  signUpSignIn: process.env.REACT_APP_AZURE_B2C_POLICY_NAME || 'B2C_1_signupsignin',
  resetPassword: process.env.REACT_APP_AZURE_B2C_RESET_PASSWORD_POLICY || 'B2C_1_passwordreset',
  editProfile: process.env.REACT_APP_AZURE_B2C_EDIT_PROFILE_POLICY || 'B2C_1_profileedit',
};