import React from 'react';
import { usePetStore } from '../store/petStore';

export default function ConsoleFrame({ children, currentTab, setTab }) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-cozy-bg box-border">
      {/* Top Header Bar */}
      <header className="bg-white border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full">
        <div className="max-w-5xl mx-auto flex justify-between items-center w-full px-4 box-border">
          {/* Logo container with vertical centering */}
          <div className="flex items-center gap-2">
            <svg 
              className="inline-block" 
              viewBox="0 0 16 16" 
              width="16" 
              height="16" 
              fill="none" 
              stroke="var(--color-cozy-accent)" 
              strokeWidth="2.5" 
              strokeLinecap="square"
            >
              <path d="M3,4 L8,8 L3,12" />
              <line x1="9" y1="12" x2="14" y2="12" />
            </svg>
            <span className="font-press text-xs font-bold text-cozy-accent">PRXXIE</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex gap-2">
            <button 
              onClick={() => setTab('home')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'home' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              HOME
            </button>
            <button 
              onClick={() => setTab('about')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'about' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              ABOUT
            </button>
            <button 
              onClick={() => setTab('posts')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'posts' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              POSTS
            </button>
            <button 
              onClick={() => setTab('pets')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'pets' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              PETS
            </button>
          </nav>
        </div>
      </header>

      {/* Content Section */}
      <main className="w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border">
        {children}
      </main>
    </div>
  );
}
