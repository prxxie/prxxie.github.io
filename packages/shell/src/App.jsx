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
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <p className="font-press text-[12px] text-red-600">⚠ MFE LOAD ERROR</p>
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

  const renderContent = () => {
    switch (tab) {
      case 'about':
        return <AboutApp />;
      case 'posts':
        return <PostsApp />;
      case 'pets':
        return <PetsApp usePetStore={usePetStore} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="font-press text-[18px] mb-4">WELCOME HOME</h1>
            <p className="text-lg">I am prxxie. This is my cozy retro pocket portal. Nav-select below to explore pages!</p>
            <div className="w-16 h-16 bg-cozy-text mt-6 animate-bounce" style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
            }}></div>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConsoleFrame currentTab={tab} setTab={setTab}>
        <Suspense fallback={<div className="font-press text-center pt-10 text-[10px]">LOADING MFE...</div>}>
          {renderContent()}
        </Suspense>
      </ConsoleFrame>
    </QueryClientProvider>
  );
}
