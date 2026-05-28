import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('Shell Host App', () => {
  it('renders welcoming header text', () => {
    render(<App />);
    expect(screen.getByText('WELCOME HOME')).toBeInTheDocument();
  });

  it('navigates to different tabs on button clicks', () => {
    render(<App />);
    
    // Click ABOUT button
    fireEvent.click(screen.getByText('ABOUT'));
    expect(screen.getByText('LOADING MFE...')).toBeInTheDocument();
  });
});
