import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./components/regions/Header";
import Footer from "./components/regions/Footer";
import SkipLink from "./components/regions/SkipLink";
import { useProgressService } from "./hooks/useProgressService";
import { useLegacyHashRedirect } from "./hooks/useLegacyHashRedirect";

const PetsApp = lazy(() => import("pets/PetsApp"));

function titleFor(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/games")) return "Games";
  if (pathname.startsWith("/devlog")) return "Devlog";
  return "Not found";
}

/**
 * The three regions of every page. The main region is focused and scrolled to the
 * top on every route change so a keyboard or screen-reader user starts at the
 * content they asked for.
 */
export default function AppShell(): React.ReactElement {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const progress = useProgressService();

  useLegacyHashRedirect();

  useEffect(() => {
    setIsPanelOpen(false);
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [pathname]);

  // The pet is a remote, so the build renders a sentence where the widget goes
  // instead of suspending: `renderToString` cannot wait for a fetcher to arrive.
  const petHud = import.meta.env.SSR ? (
    <p className="panel-body text-[11px] text-muted">The pet lives in the footer and wakes up in the browser.</p>
  ) : (
    <Suspense fallback={<p className="panel-body text-[11px] text-muted">Loading the pet…</p>}>
      <PetsApp progressState={progress} />
    </Suspense>
  );

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SkipLink />
      <Header onMobileHud={() => setIsPanelOpen(true)} />

      <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 outline-none">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
          <section aria-labelledby="region-title" className="panel lg:col-span-3">
            <div className="panel-header">
              <p id="region-title" className="panel-header-accent font-body text-[12px] font-semibold">
                {titleFor(pathname)}
              </p>
            </div>
            <div className="panel-body min-h-[350px]">
              <Suspense fallback={<p className="p-4 text-[12px] text-muted">Loading…</p>}>
                <Outlet />
              </Suspense>
            </div>
          </section>

          <aside aria-label="Pet and progress" className="hidden flex-col gap-4 lg:flex">
            <div className="panel">
              <div className="panel-header">
                <span className="panel-header-accent">Pet</span>
              </div>
              <div className="panel-body p-0">{petHud}</div>
            </div>
              </aside>
        </div>
      </main>

      <Footer />

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setIsPanelOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Pet and progress"
            className="absolute inset-y-0 right-0 flex w-80 flex-col gap-4 overflow-y-auto border-l border-hairline bg-canvas p-4"
          >
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="font-code text-[11px] text-muted">Pet and progress</span>
              <button type="button" className="btn px-2 py-1 text-[11px]" onClick={() => setIsPanelOpen(false)}>
                Close
              </button>
            </div>
            <div className="panel">
              <div className="panel-body p-0">{petHud}</div>
            </div>
              </div>
        </div>
      )}
    </div>
  );
}
