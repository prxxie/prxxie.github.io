import React, { useState, useEffect, lazy, Suspense } from 'react';
import ConsoleFrame from './components/ConsoleFrame';
import { usePetStore } from './store/petStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Lazy load MFEs with fallbacks
const AboutApp = lazy(() => import('about/AboutApp').catch(() => ({ default: () => <Fallback name="About" /> })));
const PostsApp = lazy(() => import('posts/PostsApp').catch(() => ({ default: () => <Fallback name="Posts" /> })));
const PetsApp = lazy(() => import('pets/PetsApp').catch(() => ({ default: () => <Fallback name="Pets" /> })));

function Fallback({ name }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
      <p className="font-press text-[10px] text-red-600">⚠ MFE LOAD ERROR</p>
      <p className="text-sm text-center">Remote `{name}` is offline.</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const tick = usePetStore((state) => state.tick);

  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 5000); // Stat decays every 5 seconds
    return () => clearInterval(timer);
  }, [tick]);

  const renderMainContent = () => {
    switch (tab) {
      case 'about':
        return <AboutApp />;
      case 'posts':
        return <PostsApp />;
      case 'pets':
        // On mobile, show pets page in full if that tab is active
        return (
          <div className="block md:hidden">
            <PetsApp usePetStore={usePetStore} />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="font-press text-[14px] mb-4 text-cozy-accent">WELCOME HOME</h1>
            <p className="text-lg">I am prxxie. This is my responsive retro dashboard workspace. Swivel tabs above to see more sections!</p>
            <div className="w-12 h-12 bg-cozy-accent mt-6 animate-bounce" style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
            }}></div>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full flex justify-center min-h-screen">
        <ConsoleFrame currentTab={tab} setTab={setTab}>
          {/* Grid Layout: Main panel left, Pet sidebar right (desktop only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Active Sub-page (Left Side Panel) */}
            {tab !== 'pets' && (
              <div className="col-span-1 md:col-span-2 retro-window">
                <div className="window-header">
                  <span>📖 <span className="window-header-accent">{tab.toUpperCase()}_VIEW.EXE</span></span>
                  <span className="text-cozy-accent font-bold cursor-pointer">[X]</span>
                </div>
                <div className="window-body min-h-[350px]">
                  <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING MFE...</div>}>
                    {renderMainContent()}
                  </Suspense>
                </div>
              </div>
            )}

            {/* Stacking fallback when pets page is opened on mobile */}
            {tab === 'pets' && (
              <div className="col-span-1 md:col-span-2 retro-window block md:hidden">
                <div className="window-header">
                  <span>🐾 <span className="window-header-accent">PETS_VIEW.EXE</span></span>
                  <span className="text-cozy-accent font-bold cursor-pointer">[X]</span>
                </div>
                <div className="window-body min-h-[350px]">
                  <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING MFE...</div>}>
                    {renderMainContent()}
                  </Suspense>
                </div>
              </div>
            )}

            {/* Tamagotchi Sidebar Room (Right Side Panel - Always visible on desktop, stows below content on mobile) */}
            <div className={`col-span-1 retro-window ${tab === 'pets' ? 'block' : 'hidden md:block'}`}>
              <div className="window-header">
                <span>🐾 <span className="window-header-accent">PET_HUD.EXE</span></span>
                <span className="text-cozy-accent font-bold cursor-pointer">[-]</span>
              </div>
              <div className="window-body min-h-[350px]">
                <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING PET...</div>}>
                  <PetsApp usePetStore={usePetStore} />
                </Suspense>
              </div>
            </div>

          </div>
        </ConsoleFrame>
      </div>
    </QueryClientProvider>
  );
}
