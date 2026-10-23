import React from "react";

/** First focusable element on every page; jumps to the main region. */
export default function SkipLink(): React.ReactElement {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  );
}
