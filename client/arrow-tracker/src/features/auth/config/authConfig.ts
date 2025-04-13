// B2C Authentication configuration for MSAL.js
import { Configuration, LogLevel } from '@azure/msal-browser';

// B2C tenant configuration
const tenantName = process.env.REACT_APP_B2C_TENANT_NAME || '';
const clientId = process.env.REACT_APP_B2C_CLIENT_ID || '';
const signUpSignInPolicy = process.env.REACT_APP_B2C_SIGN_UP_SIGN_IN_POLICY || 'B2C_1_signupsignin';
const resetPasswordPolicy = process.env.REACT_APP_B2C_RESET_PASSWORD_POLICY || 'B2C_1_passwordreset';
const editProfilePolicy = process.env.REACT_APP_B2C_EDIT_PROFILE_POLICY || 'B2C_1_profileedit';

// Authority URLs
const authorityDomain = `${tenantName}.b2clogin.com`;
const authorityBase = `https://${authorityDomain}/${tenantName}.onmicrosoft.com`;

// B2C policy-specific authority URLs
export const b2cPolicies = {
  names: {
    signUpSignIn: signUpSignInPolicy,
    resetPassword: resetPasswordPolicy,
    editProfile: editProfilePolicy
  },
  authorities: {
    signUpSignIn: {
      authority: `${authorityBase}/${signUpSignInPolicy}`
    },
    resetPassword: {
      authority: `${authorityBase}/${resetPasswordPolicy}`
    },
    editProfile: {
      authority: `${authorityBase}/${editProfilePolicy}`
    }
  },
  authorityDomain
};

// MSAL configuration object
export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: window.location.origin, // Defaults to the app's root URL
    postLogoutRedirectUri: window.location.origin // Defaults to the app's root URL
  },
  cache: {
    cacheLocation: 'localStorage', // Configures cache location (sessionStorage is more secure but clears on browser close)
    storeAuthStateInCookie: false // Set to true for IE 11 support
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return; // Don't log PII (Personally Identifiable Information)
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
      logLevel: process.env.NODE_ENV === 'development' ? LogLevel.Verbose : LogLevel.Warning
    }
  }
};

// API permission scopes
export const apiScopes = {
  user: [`https://${tenantName}.onmicrosoft.com/api/user.read`]
};

// Login request configuration
export const loginRequest = {
  scopes: apiScopes.user
};

// API endpoints
export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || '',
  userProfile: '/api/user/profile',
  health: '/api/health'
};