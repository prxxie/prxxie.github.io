import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsoleFrame from './ConsoleFrame';
import { useUiStore } from '../store/uiStore';

describe('ConsoleFrame Responsive Menu', () => {
  beforeEach(() => {
    useUiStore.setState({ isMenuOpen: false });
  });

  it('renders standard horizontal buttons and hides mobile menu button by default', () => {
    render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    // Desktop navigation checks
    expect(screen.getByText('HOME')).toBeInTheDocument();
    
    // Toggle button should be rendered but styled hidden on desktop
    const menuBtn = screen.getByRole('button', { name: '[MENU.EXE]' });
    expect(menuBtn).toBeInTheDocument();
    expect(menuBtn).toHaveClass('md:hidden');
  });

  it('opens offcanvas menu drawer when clicking [MENU.EXE]', () => {
    render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    const menuBtn = screen.getByRole('button', { name: '[MENU.EXE]' });
    fireEvent.click(menuBtn);
    
    // Zustand state check
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    // Verify offcanvas contents
    expect(screen.getByText('📂 MENU.EXE')).toBeInTheDocument();
    
    // Drawer close action check
    const closeBtn = screen.getByRole('button', { name: '[X]' });
    fireEvent.click(closeBtn);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
