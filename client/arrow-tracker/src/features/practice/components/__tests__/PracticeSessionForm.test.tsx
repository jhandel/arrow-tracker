import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PracticeSessionForm from '../PracticeSessionForm';
import '@testing-library/jest-dom';

describe('PracticeSessionForm', () => {
  // Mock functions for props
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  // Helper function to render the component with standard props
  const renderForm = () => {
    return render(
      <PracticeSessionForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default values', () => {
    renderForm();

    // Check if title is rendered
    expect(screen.getByText('New Practice Session')).toBeInTheDocument();
    
    // Check if required inputs are rendered
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    
    // For Material UI Select, need to look for the InputLabel instead
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    
    // Check if weather section is rendered
    expect(screen.getByText('Weather Conditions')).toBeInTheDocument();
    expect(screen.getAllByText('Conditions')[0]).toBeInTheDocument(); // Use getAllByText
    expect(screen.getByLabelText(/Temperature/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wind Speed/i)).toBeInTheDocument();
    expect(screen.getAllByText('Wind Direction')[0]).toBeInTheDocument(); // Use getAllByText for multiple elements
    
    // Check if notes section is rendered
    expect(screen.getByText('Additional Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter any additional notes/i)).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Practice/i })).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    renderForm();
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the Back button is clicked', () => {
    renderForm();
    
    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors when submitting with empty required fields', async () => {
    renderForm();
    
    // Submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /Start Practice/i });
    fireEvent.click(submitButton);
    
    // Check if validation error messages are shown
    await waitFor(() => {
      expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Equipment selection is required/i)).toBeInTheDocument();
    });
    
    // Ensure onSubmit is not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('accepts and submits invalid numeric inputs in weather section', async () => {
    renderForm();
    
    // Enter invalid values in numeric fields
    const temperatureInput = screen.getByLabelText(/Temperature/i);
    fireEvent.change(temperatureInput, { target: { value: 'abc' } });
    
    const windSpeedInput = screen.getByLabelText(/Wind Speed/i);
    fireEvent.change(windSpeedInput, { target: { value: 'xyz' } });
    
    // Fill in required location field to avoid that validation error
    const locationInput = screen.getByLabelText(/Location/i);
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    
    // Find the select elements by their ID attributes
    const selectId = 'mui-component-select-equipmentId';
    const equipmentSelect = document.getElementById(selectId);
    fireEvent.mouseDown(equipmentSelect);
    
    // Select the first option from dropdown
    const options = await screen.findAllByRole('option');
    fireEvent.click(options[0]);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Start Practice/i });
    fireEvent.click(submitButton);
    
    // Verify that onSubmit was called, but with empty temperature and windSpeed values
    // due to the component's validation behavior
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        location: 'Test Location',
        equipmentId: '1',
        weather: expect.objectContaining({
          temperature: '',  // Invalid numeric input is cleared
          windSpeed: ''     // Invalid numeric input is cleared
        })
      }));
    });
  });

  it('successfully submits the form when all required fields are filled', async () => {
    renderForm();
    
    // Fill required fields
    const locationInput = screen.getByLabelText(/Location/i);
    fireEvent.change(locationInput, { target: { value: 'Archery Range' } });
    
    // Find the select elements by their ID attributes
    const selectId = 'mui-component-select-equipmentId';
    const equipmentSelect = document.getElementById(selectId);
    fireEvent.mouseDown(equipmentSelect);
    
    // Select the first option from dropdown
    const options = await screen.findAllByRole('option');
    fireEvent.click(options[0]);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Start Practice/i });
    fireEvent.click(submitButton);
    
    // Verify onSubmit is called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        location: 'Archery Range',
        equipmentId: '1'
      }));
    });
  });

  it('updates form state when inputs change', () => {
    renderForm();
    
    // Change location
    const locationInput = screen.getByLabelText(/Location/i);
    fireEvent.change(locationInput, { target: { value: 'Indoor Range' } });
    expect(locationInput).toHaveValue('Indoor Range');
    
    // Change notes
    const notesInput = screen.getByPlaceholderText(/Enter any additional notes/i);
    fireEvent.change(notesInput, { target: { value: 'Test notes' } });
    expect(notesInput).toHaveValue('Test notes');
    
    // Change temperature
    const temperatureInput = screen.getByLabelText(/Temperature/i);
    fireEvent.change(temperatureInput, { target: { value: '75' } });
    expect(temperatureInput).toHaveValue(75);
  });
});