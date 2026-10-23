import React from "react";
import { Link, useRouteError } from "react-router";

interface ErrorBoundaryProps {
  /** Named in the message so the reader knows which part of the page failed. */
  title: string;
  children: React.ReactNode;
  /** Changing this clears a previous failure — a new game, a new post. */
  resetKey?: string;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Keeps a failure inside the subtree that caused it: the header, the navigation
 * and the footer stay usable, only the region is replaced.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="panel" role="alert">
        <div className="panel-header">
          <span className="panel-header-accent">{this.props.title}</span>
        </div>
        <div className="panel-body flex flex-col gap-3 p-4">
          <p className="text-sm">This part of the page could not be loaded.</p>
          <p className="text-muted text-[13px]">
            Nothing else is affected — the menu above still works.
          </p>
          <Link to="/" className="btn btn-primary w-fit px-4 py-2 text-[12px] no-underline">
            Back to the front page
          </Link>
        </div>
      </div>
    );
  }
}

/** The route-level fallback: same message, but it also reports what threw. */
export function RouteError(): React.ReactElement {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "The route failed without a message.";

  return (
    <div className="panel" role="alert">
      <div className="panel-header">
        <span className="panel-header-accent">Page error</span>
      </div>
      <div className="panel-body flex flex-col gap-3 p-4">
        <h1 className="text-lg font-display">This page broke</h1>
        <p className="text-sm">
          The page failed while it was rendering. The rest of the site still works.
        </p>
        <p className="font-code text-[12px] text-muted">{message}</p>
        <Link to="/" className="btn btn-primary w-fit px-4 py-2 text-[12px] no-underline">
          Back to the front page
        </Link>
      </div>
    </div>
  );
}
