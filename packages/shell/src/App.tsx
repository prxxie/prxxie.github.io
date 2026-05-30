import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import ConsoleFrame from "./components/ConsoleFrame";
import { PixelBookIcon, PixelPawIcon } from "./components/Icons";
import { usePetStore } from "./store/petStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHashRouter } from "./hooks/useHashRouter";
import MatrixMenu from "./components/MatrixMenu";
import StatsTelemetry from "./components/StatsTelemetry";
import HomeDashboard from "./components/HomeDashboard";

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

function Fallback({ name }: { name: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
      <p className="font-press text-[10px] text-red-600">⚠ MFE LOAD ERROR</p>
      <p className="text-sm text-center">Remote `{name}` is offline.</p>
    </div>
  );
}

export default function App(): React.ReactElement {
  const { currentTab, navigate } = useHashRouter();
  const tick = usePetStore((state) => state.tick);
  const windowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPetHudOpen, setIsPetHudOpen] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 5000);
    return () => clearInterval(timer);
  }, [tick]);

  const renderMainContent = (): React.ReactNode => {
    switch (currentTab) {
      case "about":
        return <AboutApp />;
      case "posts":
        return <PostsApp />;
      case "pets":
        return <PetsApp usePetStore={usePetStore} />;
      case "shikaku":
        return <ShikakuApp />;
      case "sokoban":
        return <SokobanApp />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full flex justify-center min-h-screen">
        <ConsoleFrame currentTab={currentTab} setTab={navigate}>
          <div className="grid grid-cols-1 md:grid-cols-20 gap-6 items-start">
            <div
              ref={windowRef}
              className={`col-span-1 ${
                currentTab === "pets" ? "md:col-span-20" : "md:col-span-13"
              } retro-window`}
            >
              <div className="window-header">
                <span className="flex items-center gap-1">
                  <PixelBookIcon className="w-3.5 h-3.5" />
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
                    <div className="font-press text-center pt-10 text-[8px]">
                      LOADING MFE...
                    </div>
                  }
                >
                  {renderMainContent()}
                </Suspense>
              </div>
            </div>

            {currentTab !== "pets" && (
              <div className="hidden md:flex md:col-span-7 flex-col gap-4">
                <MatrixMenu currentTab={currentTab} navigate={navigate} />

                <div className="retro-window">
                  <div className="window-header">
                    <span className="flex items-center gap-1">
                      <PixelPawIcon className="w-3.5 h-3.5" />
                      <span className="window-header-accent">PET_HUD</span>
                    </span>
                    <span className="text-cozy-accent font-bold cursor-pointer">
                      [-]
                    </span>
                  </div>
                  <div className="window-body min-h-[160px] p-2">
                    <Suspense
                      fallback={
                        <div className="font-press text-center pt-4 text-[8px]">
                          LOADING PET...
                        </div>
                      }
                    >
                      <PetsApp usePetStore={usePetStore} />
                    </Suspense>
                  </div>
                </div>

                <StatsTelemetry />
              </div>
            )}
          </div>

          {currentTab !== "pets" && (
            <button
              onClick={() => setIsPetHudOpen(true)}
              className="md:hidden fixed bottom-6 right-6 z-40 pixel-btn text-[9px]"
            >
              [ MOBILE HUD ]
            </button>
          )}

          {isPetHudOpen && (
            <div
              className="fixed inset-0 bg-black/75 z-45 md:hidden"
              onClick={() => setIsPetHudOpen(false)}
            />
          )}
          <div
            className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l border-cozy-border z-50 p-4 flex flex-col gap-4 transition-transform duration-300 md:hidden ${
              isPetHudOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center border-b border-dashed border-cozy-border pb-2">
              <span className="font-press text-[9px] text-cozy-text flex items-center gap-1">
                <PixelPawIcon className="w-3.5 h-3.5" /> MOBILE_HUD
              </span>
              <button
                onClick={() => setIsPetHudOpen(false)}
                className="text-cozy-text font-bold cursor-pointer font-press text-[9px] bg-transparent border-none"
              >
                [X]
              </button>
            </div>

            <MatrixMenu
              currentTab={currentTab}
              navigate={(tab) => {
                navigate(tab);
                setIsPetHudOpen(false);
              }}
            />

            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              <div className="border border-cozy-border p-2">
                <Suspense
                  fallback={
                    <div className="font-press text-center pt-4 text-[8px]">
                      LOADING PET...
                    </div>
                  }
                >
                  <PetsApp usePetStore={usePetStore} />
                </Suspense>
              </div>

              <StatsTelemetry />
            </div>
          </div>
        </ConsoleFrame>
      </div>
    </QueryClientProvider>
  );
}
