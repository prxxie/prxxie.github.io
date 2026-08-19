import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHashRouter } from "./hooks/useHashRouter";
import ConsoleFrame from "./components/ConsoleFrame";
import MatrixMenu from "./components/MatrixMenu";
import StatsTelemetry from "./components/StatsTelemetry";
import HomeDashboard from "./components/HomeDashboard";
import MfeLoader from "./components/MfeLoader";
import { useProgressService, ProgressServiceProvider } from "./hooks/useProgressService";
import { supabase } from "./utils/supabase";
import CloudSyncModal from "./components/CloudSyncModal";

const queryClient = new QueryClient();

const AboutApp = lazy(
  () =>
    import("about/AboutApp").catch(() => ({
      default: () => <Fallback name="About" />,
    }))
);

const PostsApp = lazy(
  () =>
    import("posts/PostsApp").catch(() => ({
      default: () => <Fallback name="Posts" />,
    }))
);

const PetsApp = lazy(
  () =>
    import("pets/PetsApp").catch(() => ({
      default: () => <Fallback name="Pets" />,
    }))
);

const ShikakuApp = lazy(
  () =>
    import("shikaku/ShikakuApp").catch(() => ({
      default: () => <Fallback name="Shikaku" />,
    }))
);

const SokobanApp = lazy(
  () =>
    import("sokoban/SokobanApp").catch(() => ({
      default: () => <Fallback name="Sokoban" />,
    }))
);

const SlitherlinkApp = lazy(
  () =>
    import("slitherlink/SlitherlinkApp").catch(() => ({
      default: () => <Fallback name="Slitherlink" />,
    }))
);

function Fallback({ name }: { name: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
      <p className="font-press text-[10px] text-red-600">⚠ MFE LOAD ERROR</p>
      <p className="text-sm text-center">Remote `{name}` is offline.</p>
    </div>
  );
}

function AppContent(): React.ReactElement {
  const { currentTab, navigate } = useHashRouter();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const progressService = useProgressService();

  const [cloudUser, setCloudUser] = useState<string | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const checkUser = async () => {
      try {
        const { data: { user } } = await client.auth.getUser();
        setCloudUser(user?.email || null);
      } catch (err) {
        console.error("Failed to retrieve user session:", err);
      }
    };
    void checkUser();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user?.email || null);
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      if (windowRef.current) {
        windowRef.current.requestFullscreen().catch((err: Error) => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      }
    } else {
      document.exitFullscreen().catch((err: Error) => {
        console.error("Failed to exit fullscreen mode:", err);
      });
    }
  };

  const renderMainContent = (): React.ReactNode => {
    switch (currentTab) {
      case "about":
        return <AboutApp />;
      case "posts":
        return <PostsApp />;
      case "shikaku":
        return <ShikakuApp />;
      case "sokoban":
        return <SokobanApp />;
      case "slitherlink":
        return <SlitherlinkApp />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ConsoleFrame
          onMobileHud={() => setIsMobileHudOpen(true)}
          onCloudClick={() => setIsCloudModalOpen(true)}
          cloudUser={cloudUser}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div
              ref={windowRef}
              className="lg:col-span-3 retro-window"
            >
              <div className="window-header">
                <span className="flex items-center gap-1">
                  <span className="window-header-accent">
                    {currentTab.toUpperCase()}_VIEW
                  </span>
                </span>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={toggleFullscreen}
                    className="text-cozy-accent font-bold cursor-pointer hover:underline bg-transparent border-none p-0 font-press text-[9px]"
                    aria-label="Toggle Fullscreen"
                  >
                    {isFullscreen ? "[🗗]" : "[⛶]"}
                  </button>
                  <span className="text-cozy-accent font-bold cursor-pointer">
                    [X]
                  </span>
                </div>
              </div>
              <div className="window-body min-h-[350px]">
                <Suspense
                  fallback={
                    <MfeLoader petStage={progressService.state.pet.stage} />
                  }
                >
                  {renderMainContent()}
                </Suspense>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
              <MatrixMenu currentTab={currentTab} navigate={navigate} />

              <div className="retro-window">
                <div className="window-header">
                  <span className="flex items-center gap-1">
                    <span className="window-header-accent">PET_HUD</span>
                  </span>
                  <span className="text-cozy-accent font-bold cursor-pointer">
                    [-]
                  </span>
                </div>
                <div className="window-body p-0">
                  <Suspense fallback={<MfeLoader petStage={progressService.state.pet.stage} />}>
                    <PetsApp progressState={progressService} />
                  </Suspense>
                </div>
              </div>

              <StatsTelemetry />
            </div>
          </div>

          {isMobileHudOpen && (
            <div
              className="fixed inset-0 bg-black/75 z-45 lg:hidden"
              onClick={() => setIsMobileHudOpen(false)}
            />
          )}
          <div
            className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l border-cozy-border z-50 p-4 flex flex-col gap-4 transition-transform duration-300 lg:hidden ${
              isMobileHudOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center border-b border-dashed border-cozy-border pb-2">
              <span className="font-press text-[9px] text-cozy-text flex items-center gap-1">
                MOBILE_HUD
              </span>
              <button
                onClick={() => setIsMobileHudOpen(false)}
                className="text-cozy-text font-bold cursor-pointer font-press text-[9px] bg-transparent border-none"
              >
                [X]
              </button>
            </div>

            <MatrixMenu
              currentTab={currentTab}
              navigate={(tab) => {
                navigate(tab);
                setIsMobileHudOpen(false);
              }}
            />

            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              <div className="border border-cozy-border">
                <Suspense fallback={<MfeLoader petStage={progressService.state.pet.stage} />}>
                  <PetsApp progressState={progressService} />
                </Suspense>
              </div>

              <StatsTelemetry />
            </div>
          </div>
        </ConsoleFrame>
        <CloudSyncModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          cloudUser={cloudUser}
        />
      </div>
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <ProgressServiceProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ProgressServiceProvider>
  );
}
