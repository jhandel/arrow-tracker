import React from 'react';
import { render, screen } from './test-utils/test-utils';
import App from './App';

test('renders application container', () => {
  render(<App />);
  // Test that the root Box container is rendered
  const boxElement = document.querySelector('.MuiBox-root');
  expect(boxElement).toBeInTheDocument();
});

// Since our App is a router, we should test route-specific content in component-specific tests
// rather than in the App test.
