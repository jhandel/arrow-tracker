import React from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disablePadding?: boolean;
}

/**
 * Responsive layout component for consistent page structure
 * Adapts container width based on screen size
 */
const ResponsiveLayout: React.FC<LayoutProps> = ({ 
  children,
  maxWidth = 'sm',
  disablePadding = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container 
      maxWidth={maxWidth}
      disableGutters={isMobile && disablePadding}
    >
      <Box 
        sx={{ 
          padding: disablePadding ? 0 : isMobile ? 2 : 3,
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default ResponsiveLayout;