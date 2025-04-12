import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import ResponsiveLayout from './ResponsiveLayout';

describe('ResponsiveLayout', () => {
  test('renders children correctly', () => {
    render(
      <ResponsiveLayout>
        <div data-testid="test-child">Test Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies correct maxWidth prop', () => {
    render(
      <ResponsiveLayout maxWidth="md">
        <div>Content</div>
      </ResponsiveLayout>
    );
    
    // Material UI adds a class with the maxWidth value
    const container = screen.getByText('Content').closest('.MuiContainer-root');
    expect(container).toHaveClass('MuiContainer-maxWidthMd');
  });
});