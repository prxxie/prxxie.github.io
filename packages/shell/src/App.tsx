import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import ConsoleFrame from "./components/ConsoleFrame";
import { PixelBookIcon, PixelPawIcon } from "./components/Icons";
import { usePetStore } from "./store/petStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Tab } from "./types";

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

function Fallback({ name }: { name: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
      <p className="font-press text-[10px] text-red-600">⚠ MFE LOAD ERROR</p>
      <p className="text-sm text-center">Remote `{name}` is offline.</p>
    </div>
  );
}

export default function App(): React.ReactElement {
  const [tab, setTab] = useState<Tab>("home");
  const tick = usePetStore((state) => state.tick);
  const windowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    switch (tab) {
      case "about":
        return <AboutApp />;
      case "posts":
        return <PostsApp />;
      case "pets":
        return <PetsApp usePetStore={usePetStore} />;
      case "shikaku":
        return <ShikakuApp />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="font-press text-[14px] mb-4 text-cozy-accent">
              WELCOME HOME
            </h1>
            <p className="text-lg">
              I am prxxie. This is my responsive retro dashboard workspace.
              Swivel tabs above to see more sections!
            </p>
            <div
              className="w-12 h-12 bg-cozy-accent mt-6 animate-bounce"
              style={{
                clipPath:
                  "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
              }}
            ></div>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full flex justify-center min-h-screen">
        <ConsoleFrame currentTab={tab} setTab={setTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div
              ref={windowRef}
              className={`col-span-1 ${tab === "pets" ? "md:col-span-3" : "md:col-span-2"} retro-window`}
            >
              <div className="window-header">
                <span className="flex items-center gap-1">
                  <PixelBookIcon className="w-3.5 h-3.5" />
                  <span className="window-header-accent">
                    {tab.toUpperCase()}_VIEW.EXE
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

            {tab !== "pets" && (
              <div className="col-span-1 retro-window">
                <div className="window-header">
                  <span className="flex items-center gap-1">
                    <PixelPawIcon className="w-3.5 h-3.5" />
                    <span className="window-header-accent">PET_HUD.EXE</span>
                  </span>
                  <span className="text-cozy-accent font-bold cursor-pointer">
                    [-]
                  </span>
                </div>
                <div className="window-body min-h-[350px]">
                  <Suspense
                    fallback={
                      <div className="font-press text-center pt-10 text-[8px]">
                        LOADING PET...
                      </div>
                    }
                  >
                    <PetsApp usePetStore={usePetStore} />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </ConsoleFrame>
      </div>
    </QueryClientProvider>
  );
}
