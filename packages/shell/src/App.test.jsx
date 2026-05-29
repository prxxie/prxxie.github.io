import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('Shell Host App', () => {
  let requestFullscreenMock;
  let exitFullscreenMock;
  let originalFullscreenElementDescriptor;

  beforeEach(() => {
    requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    HTMLDivElement.prototype.requestFullscreen = requestFullscreenMock;

    exitFullscreenMock = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = exitFullscreenMock;

    originalFullscreenElementDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete HTMLDivElement.prototype.requestFullscreen;
    delete document.exitFullscreen;

    if (originalFullscreenElementDescriptor) {
      Object.defineProperty(document, 'fullscreenElement', originalFullscreenElementDescriptor);
    } else {
      delete document.fullscreenElement;
    }
    vi.restoreAllMocks();
  });

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

  it('toggles fullscreen state when button is clicked', () => {
    render(<App />);

    // Get the fullscreen toggle button
    const toggleButton = screen.getByLabelText('Toggle Fullscreen');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('[⛶]');

    // Click it to trigger requestFullscreen
    fireEvent.click(toggleButton);
    expect(requestFullscreenMock).toHaveBeenCalled();

    // Now mock document.fullscreenElement to be active to test exitFullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: {},
      writable: true,
      configurable: true,
    });

    // Dispatch event to simulate fullscreenchange event
    fireEvent(document, new Event('fullscreenchange'));

    // The button content should now change to [🗗] because isFullscreen is true
    expect(toggleButton).toHaveTextContent('[🗗]');

    // Click again to exit fullscreen
    fireEvent.click(toggleButton);
    expect(exitFullscreenMock).toHaveBeenCalled();

    // Reset document.fullscreenElement to null
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
    fireEvent(document, new Event('fullscreenchange'));
    expect(toggleButton).toHaveTextContent('[⛶]');
  });
});
