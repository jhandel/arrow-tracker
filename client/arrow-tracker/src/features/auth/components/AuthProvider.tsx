import React from 'react';
import { MsalProvider, MsalAuthenticationTemplate } from '@azure/msal-react';
import { PublicClientApplication, InteractionType, InteractionStatus } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/authConfig';
import { Box, CircularProgress, Typography } from '@mui/material';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Loading component for authentication state
const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Authenticating...
      </Typography>
    </Box>
  );
};

// Error component for authentication failures
const ErrorComponent = (error: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3,
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Authentication Error
      </Typography>
      <Typography variant="body1">
        {error.errorMessage || 'Failed to authenticate. Please try again.'}
      </Typography>
    </Box>
  );
};

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthProvider wraps the application with MSAL authentication context
 * If requireAuth is true, it ensures the user is authenticated before rendering children
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children, requireAuth = true }) => {
  // Wrap the entire application with MSAL provider
  return (
    <MsalProvider instance={msalInstance}>
      {requireAuth ? (
        // Use MsalAuthenticationTemplate to enforce authentication
        <MsalAuthenticationTemplate
          interactionType={InteractionType.Redirect}
          authenticationRequest={loginRequest}
          loadingComponent={Loading}
          errorComponent={ErrorComponent}
        >
          {children}
        </MsalAuthenticationTemplate>
      ) : (
        // Don't enforce authentication (for public pages)
        children
      )}
    </MsalProvider>
  );
};

export default AuthProvider;
export { msalInstance };