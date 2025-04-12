import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  Avatar,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon,
  Timeline as TimelineIcon, 
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../auth/hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Home dashboard component that displays practice statistics and quick actions
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data for recent practices - would come from Redux/API in production
  const recentPractices = [
    { id: 1, date: '2025-04-10', location: 'Archery Range', totalShots: 60, avgScore: 8.7 },
    { id: 2, date: '2025-04-08', location: 'Backyard', totalShots: 30, avgScore: 8.2 }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with greeting and profile info */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}>
          {user?.name?.charAt(0) || 'A'}
        </Avatar>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Welcome, {user?.name?.split(' ')[0] || 'Archer'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {/* Quick action buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<AddIcon />}
                sx={{ height: '100%', py: 1 }}
                component={RouterLink}
                to="/practice/new"
              >
                New Practice
              </Button>
            </Box>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<InventoryIcon />}
                sx={{ height: '100%', py: 1 }}
              >
                Equipment
              </Button>
            </Box>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<TimelineIcon />}
                sx={{ height: '100%', py: 1 }}
              >
                Statistics
              </Button>
            </Box>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<SettingsIcon />}
                sx={{ height: '100%', py: 1 }}
              >
                Settings
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Recent practices */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Practices
          </Typography>
          
          {recentPractices.length > 0 ? (
            recentPractices.map((practice, index) => (
              <React.Fragment key={practice.id}>
                <Box sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
                      <Typography variant="subtitle1">
                        {practice.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(practice.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(25% - 4px)' } }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Shots
                      </Typography>
                      <Typography variant="subtitle1">
                        {practice.totalShots}
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(25% - 4px)' } }}>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Score
                      </Typography>
                      <Typography variant="subtitle1">
                        {practice.avgScore.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < recentPractices.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <HistoryIcon color="disabled" sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
              <Typography color="text.secondary">
                No recent practices found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Start your archery journey by adding your first practice session
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button size="small" fullWidth>
            View All Practice History
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Dashboard;