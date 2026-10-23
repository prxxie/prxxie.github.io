import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Outlet, useLocation } from "react-router";
import ConsoleFrame from "./components/ConsoleFrame";
import MatrixMenu from "./components/MatrixMenu";
import StatsTelemetry from "./components/StatsTelemetry";
import MfeLoader from "./components/MfeLoader";
import { useProgressService } from "./hooks/useProgressService";

const PetsApp = lazy(() => import("pets/PetsApp"));

function PetPanel(): React.ReactElement {
  const progress = useProgressService();
  const Component = PetsApp as React.ComponentType<{ progressState: ReturnType<typeof useProgressService> }>;
  return (
    <Suspense fallback={<MfeLoader petStage={progress.state.pet.stage} />}>
      <Component progressState={progress} />
    </Suspense>
  );
}

export default function AppShell(): React.ReactElement {
  const { pathname } = useLocation();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const progressService = useProgressService();

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setIsMobileHudOpen(false);
  }, [pathname]);

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      windowRef.current?.requestFullscreen().catch((err: Error) => {
        console.error("Failed to enter fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().catch((err: Error) => {
        console.error("Failed to exit fullscreen mode:", err);
      });
    }
  };

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ConsoleFrame onMobileHud={() => setIsMobileHudOpen(true)}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div ref={windowRef} className="lg:col-span-3 panel rounded-xl">
              <div className="panel-header">
                <span className="panel-header-accent">{pathname === "/" ? "Proof" : titleFor(pathname)}</span>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={toggleFullscreen}
                    className="text-muted font-medium cursor-pointer hover:text-ink bg-transparent border-none p-0 font-body text-[12px]"
                    aria-label={isFullscreen ? "Leave fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? "[×]" : "[⛶]"}
                  </button>
                </div>
              </div>
              <div className="panel-body min-h-[350px]">
                <Suspense fallback={<MfeLoader petStage={progressService.state.pet.stage} />}>
                  <Outlet />
                </Suspense>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
              <MatrixMenu />

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-header-accent">Pet</span>
                  <span className="text-muted font-medium">[-]</span>
                </div>
                <div className="panel-body p-0"><PetPanel /></div>
              </div>

              <StatsTelemetry />
            </div>
          </div>
        </ConsoleFrame>
      </div>

      {isMobileHudOpen ? (
        <>
          <div
            className="fixed inset-0 bg-ink/75 z-45 lg:hidden"
            onClick={() => setIsMobileHudOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-canvas border-l border-hairline z-50 p-4 flex flex-col gap-4 overflow-y-auto lg:hidden">
            <div className="flex justify-between items-center border-b border-hairline pb-2">
              <span className="font-code text-[11px] text-muted">Menu</span>
              <button
                onClick={() => setIsMobileHudOpen(false)}
                className="text-ink font-medium cursor-pointer font-body text-[12px] bg-transparent border-none"
              >
                Close
              </button>
            </div>
            <MatrixMenu />

            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              <div className="panel">
                <div className="panel-body p-0"><PetPanel /></div>
              </div>
              <StatsTelemetry />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function titleFor(pathname: string): string {
  if (pathname.startsWith("/games")) return "Games";
  if (pathname.startsWith("/devlog")) return "Devlog";
  return "Not found";
}
