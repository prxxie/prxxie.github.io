import React, { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./components/regions/Header";
import Footer from "./components/regions/Footer";
import SkipLink from "./components/regions/SkipLink";
import { useLegacyHashRedirect } from "./hooks/useLegacyHashRedirect";


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
  useLegacyHashRedirect();

  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SkipLink />
      <Header />

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

        </div>
      </main>

      <Footer />

    </div>
  );
}
