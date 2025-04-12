import React from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

/**
 * Login screen component that handles Azure AD B2C authentication
 */
const Login: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();

  const handleLogin = async () => {
    await login();
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Authenticating...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        backgroundColor: 'background.default'
      }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
          Arrow Tracker
        </Typography>
        
        <Box 
          component="img"
          src="/logo192.png"
          alt="Arrow Tracker Logo"
          sx={{ width: 120, height: 120, my: 3 }}
        />
        
        <Typography variant="body1" align="center" paragraph sx={{ mb: 3 }}>
          Track your archery practice sessions, record shot patterns, and analyze your progress over time.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          fullWidth
          onClick={handleLogin}
          sx={{ py: 1.5 }}
        >
          Sign In with Microsoft
        </Button>
        
        <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;