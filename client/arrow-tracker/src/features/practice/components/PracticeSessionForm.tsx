import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stack,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Mock data for equipment - would come from Redux/API in production
const mockEquipment = [
  { id: '1', name: 'Competition Recurve', type: 'recurve' },
  { id: '2', name: 'Training Compound', type: 'compound' },
  { id: '3', name: 'Traditional Longbow', type: 'traditional' }
];

// Weather condition options
const weatherConditions = [
  'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 
  'Windy', 'Foggy', 'Hot', 'Cold'
];

// Wind direction options
const windDirections = [
  'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'Variable', 'None'
];

interface PracticeFormData {
  date: string;
  time: string;
  location: string;
  equipmentId: string;
  notes: string;
  weather: {
    conditions: string;
    temperature: string;
    windSpeed: string;
    windDirection: string;
  };
}

interface PracticeSessionFormProps {
  onCancel: () => void;
  onSubmit: (data: PracticeFormData) => void;
}

/**
 * Practice session creation form component
 */
const PracticeSessionForm: React.FC<PracticeSessionFormProps> = ({ onCancel, onSubmit }) => {
  // Get current date and time for default values
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  // Form state
  const [formData, setFormData] = useState<PracticeFormData>({
    date: currentDate,
    time: currentTime,
    location: '',
    equipmentId: '',
    notes: '',
    weather: {
      conditions: '',
      temperature: '',
      windSpeed: '',
      windDirection: 'None',
    }
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear error for a field if it exists
  const clearError = (name: string) => {
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name?.includes('.')) {
      // Handle nested fields (weather object)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PracticeFormData] as object,
          [child]: value
        }
      }));
    } else if (name) {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    clearError(name);
  };

  // Handle select input changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (name?.includes('.')) {
      // Handle nested fields (weather object)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PracticeFormData] as object,
          [child]: value
        }
      }));
    } else if (name) {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    clearError(name);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.equipmentId) newErrors.equipmentId = 'Equipment selection is required';
    
    // Numeric field validation for weather data
    if (formData.weather.temperature && isNaN(Number(formData.weather.temperature))) {
      newErrors['weather.temperature'] = 'Must be a number';
    }
    
    if (formData.weather.windSpeed && isNaN(Number(formData.weather.windSpeed))) {
      newErrors['weather.windSpeed'] = 'Must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onCancel}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Typography variant="h5">New Practice Session</Typography>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Session Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid sx={{ gridColumn: { xs: '1 / span 12', sm: '1 / span 6' } }}>
              <TextField
                fullWidth
                required
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleTextChange}
                error={!!errors.date}
                helperText={errors.date}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid sx={{ gridColumn: { xs: '1 / span 12', sm: '7 / span 6' } }}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleTextChange}
              />
            </Grid>
            
            <Grid sx={{ gridColumn: '1 / span 12' }}>
              <TextField
                fullWidth
                required
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleTextChange}
                error={!!errors.location}
                helperText={errors.location}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid sx={{ gridColumn: '1 / span 12' }}>
              <FormControl fullWidth required error={!!errors.equipmentId}>
                <InputLabel>Equipment</InputLabel>
                <Select
                  name="equipmentId"
                  value={formData.equipmentId}
                  label="Equipment"
                  onChange={handleSelectChange}
                >
                  {mockEquipment.map(equipment => (
                    <MenuItem key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.type})
                    </MenuItem>
                  ))}
                </Select>
                {errors.equipmentId && (
                  <FormHelperText>{errors.equipmentId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weather Conditions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid sx={{ gridColumn: { xs: '1 / span 12', sm: '1 / span 6' } }}>
              <FormControl fullWidth>
                <InputLabel>Conditions</InputLabel>
                <Select
                  name="weather.conditions"
                  value={formData.weather.conditions}
                  label="Conditions"
                  onChange={handleSelectChange}
                >
                  {weatherConditions.map(condition => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid sx={{ gridColumn: { xs: '1 / span 12', sm: '7 / span 6' } }}>
              <TextField
                fullWidth
                label="Temperature"
                name="weather.temperature"
                value={formData.weather.temperature}
                onChange={handleTextChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">°F</InputAdornment>,
                }}
                error={!!errors['weather.temperature']}
                helperText={errors['weather.temperature']}
              />
            </Grid>
            
            <Grid sx={{ gridColumn: { xs: '1 / span 12', sm: '1 / span 6' } }}>
              <TextField
                fullWidth
                label="Wind Speed"
                name="weather.windSpeed"
                value={formData.weather.windSpeed}
                onChange={handleTextChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">mph</InputAdornment>,
                }}
                error={!!errors['weather.windSpeed']}
                helperText={errors['weather.windSpeed']}
              />
            </Grid>
            
            <Grid sx={{ gridColumn: { xs: '1 / span 12', sm: '7 / span 6' } }}>
              <FormControl fullWidth>
                <InputLabel>Wind Direction</InputLabel>
                <Select
                  name="weather.windDirection"
                  value={formData.weather.windDirection}
                  label="Wind Direction"
                  onChange={handleSelectChange}
                >
                  {windDirections.map(direction => (
                    <MenuItem key={direction} value={direction}>
                      {direction}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Additional Notes
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            name="notes"
            value={formData.notes}
            onChange={handleTextChange}
            placeholder="Enter any additional notes about this practice session..."
          />
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button variant="outlined" onClick={onCancel} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
          >
            Start Practice
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default PracticeSessionForm;