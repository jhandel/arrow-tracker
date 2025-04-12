import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import ThemeProvider from './shared/components/ThemeProvider';
import ResponsiveLayout from './shared/components/ResponsiveLayout';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import Login from './features/auth/components/Login';
import Dashboard from './features/practice/components/Dashboard';
import PracticeSessionForm from './features/practice/components/PracticeSessionForm';

/**
 * Main application component that provides providers and routing
 */
const App: React.FC = () => {
  // Mock function for handling practice form submission
  // In a real app, this would dispatch to Redux and/or call an API
  const handlePracticeSubmit = (formData: any) => {
    console.log('Practice session created:', formData);
    // Would redirect to the practice tracking screen in a real implementation
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <Router>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
              <Routes>
                {/* Public route for login */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes that require authentication */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ResponsiveLayout>
                        <Dashboard />
                      </ResponsiveLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/practice/new" 
                  element={
                    <ProtectedRoute>
                      <ResponsiveLayout>
                        <PracticeSessionForm 
                          onCancel={() => window.history.back()} 
                          onSubmit={handlePracticeSubmit} 
                        />
                      </ResponsiveLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Default redirect to dashboard if authenticated, otherwise to login */}
                <Route 
                  path="*" 
                  element={<Navigate to="/dashboard" replace />} 
                />
              </Routes>
            </Box>
          </Router>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
