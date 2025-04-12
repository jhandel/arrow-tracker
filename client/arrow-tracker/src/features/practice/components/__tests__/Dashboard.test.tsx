import React from 'react';
import { screen, render, within } from '../../../../test-utils/test-utils';
import Dashboard from '../Dashboard';

// Mock the useAuth hook
jest.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Test Archer' },
    isAuthenticated: true,
  }),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock the date to ensure consistent test results
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2025-04-12').valueOf());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders welcome message with user name', () => {
    render(<Dashboard />);
    const welcomeText = screen.getByText(/Welcome, Test/i);
    expect(welcomeText).toBeInTheDocument();
  });

  test('displays current date', () => {
    render(<Dashboard />);
    // April 12, 2025 is a Saturday
    const dateText = screen.getByText(/Saturday, April 12/i);
    expect(dateText).toBeInTheDocument();
  });

  test('renders quick action buttons', () => {
    render(<Dashboard />);
    
    const quickActionsSection = screen.getByText('Quick Actions').closest('div');
    expect(quickActionsSection).toBeInTheDocument();
    
    const newPracticeButton = screen.getByText('New Practice');
    expect(newPracticeButton).toBeInTheDocument();
    
    const equipmentButton = screen.getByText('Equipment');
    expect(equipmentButton).toBeInTheDocument();
    
    const statisticsButton = screen.getByText('Statistics');
    expect(statisticsButton).toBeInTheDocument();
    
    const settingsButton = screen.getByText('Settings');
    expect(settingsButton).toBeInTheDocument();
  });

  test('renders recent practices', () => {
    render(<Dashboard />);
    
    const recentPracticesSection = screen.getByText('Recent Practices').closest('div');
    expect(recentPracticesSection).toBeInTheDocument();
    
    // Check for mock data entries
    const archeryRangeEntry = screen.getByText('Archery Range');
    expect(archeryRangeEntry).toBeInTheDocument();
    
    const backyardEntry = screen.getByText('Backyard');
    expect(backyardEntry).toBeInTheDocument();
    
    // Check for statistics
    const totalShotsLabels = screen.getAllByText('Total Shots');
    expect(totalShotsLabels).toHaveLength(2);
    
    const avgScoreLabels = screen.getAllByText('Avg. Score');
    expect(avgScoreLabels).toHaveLength(2);
  });

  test('New Practice text is rendered', () => {
    render(<Dashboard />);
    
    // Simply check that the New Practice text exists in the document
    const newPracticeText = screen.getByText(/New Practice/i);
    expect(newPracticeText).toBeInTheDocument();
  });
});