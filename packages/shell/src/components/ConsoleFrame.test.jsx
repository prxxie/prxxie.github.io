import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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
    const menuBtn = screen.getByRole('button', { name: 'Toggle navigation menu' });
    expect(menuBtn).toBeInTheDocument();
    expect(menuBtn).toHaveClass('md:hidden');
  });

  it('opens offcanvas menu drawer when clicking [MENU.EXE]', () => {
    render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    const menuBtn = screen.getByRole('button', { name: 'Toggle navigation menu' });
    fireEvent.click(menuBtn);
    
    // Zustand state check
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    // Verify offcanvas contents
    expect(screen.getByText('📂 MENU.EXE')).toBeInTheDocument();
    
    // Drawer close action check
    const closeBtn = screen.getByRole('button', { name: 'Close navigation menu' });
    fireEvent.click(closeBtn);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it('closes the drawer when pressing the Escape key', () => {
    useUiStore.setState({ isMenuOpen: true });
    render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    // Check it starts open
    expect(screen.getByText('📂 MENU.EXE')).toBeInTheDocument();
    
    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    
    // Assert it closed
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it('closes the drawer when clicking the backdrop overlay', () => {
    useUiStore.setState({ isMenuOpen: true });
    const { container } = render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    // Find backdrop
    const backdrop = container.querySelector('.bg-black\\/45');
    expect(backdrop).toBeInTheDocument();
    
    // Click backdrop
    fireEvent.click(backdrop);
    
    // Assert it closed
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it('toggles overflow-hidden class on document body and removes it on unmount', () => {
    const { unmount } = render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    // By default menu is closed, body should not have overflow-hidden
    expect(document.body).not.toHaveClass('overflow-hidden');
    
    // Open menu
    act(() => {
      useUiStore.setState({ isMenuOpen: true });
    });
    expect(document.body).toHaveClass('overflow-hidden');
    
    // Close menu
    act(() => {
      useUiStore.setState({ isMenuOpen: false });
    });
    expect(document.body).not.toHaveClass('overflow-hidden');
    
    // Open menu again to test unmount
    act(() => {
      useUiStore.setState({ isMenuOpen: true });
    });
    expect(document.body).toHaveClass('overflow-hidden');
    
    // Unmount component
    act(() => {
      unmount();
    });
    expect(document.body).not.toHaveClass('overflow-hidden');
  });

  it('updates tab and closes drawer when a mobile navigation item is clicked', () => {
    const setTabSpy = vi.fn();
    useUiStore.setState({ isMenuOpen: true });
    
    render(<ConsoleFrame currentTab="home" setTab={setTabSpy} />);
    
    // Find the ABOUT button inside the mobile navigation drawer.
    // It should render as: "[ ] ABOUT" since currentTab is "home"
    const aboutBtn = screen.getByRole('button', { name: '[ ] ABOUT' });
    expect(aboutBtn).toBeInTheDocument();
    
    // Click it
    fireEvent.click(aboutBtn);
    
    // Assert setTab was called with 'about'
    expect(setTabSpy).toHaveBeenCalledWith('about');
    
    // Assert drawer is closed
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
