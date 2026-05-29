import React from "react";

export const PixelBookIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <path d="M1 2h6v11H1V2z M9 2h6v11H9V2z" />
    <line x1="3" y1="5" x2="5" y2="5" />
    <line x1="3" y1="8" x2="5" y2="8" />
    <line x1="11" y1="5" x2="13" y2="5" />
    <line x1="11" y1="8" x2="13" y2="8" />
  </svg>
);

export const PixelScrollIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <path d="M3 2h10v12H3V2z" />
    <line x1="6" y1="5" x2="10" y2="5" />
    <line x1="6" y1="8" x2="10" y2="8" />
    <line x1="6" y1="11" x2="10" y2="11" />
  </svg>
);

export const PixelBackIcon = ({ className = "w-3 h-3 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 8 8" fill="currentColor">
    <path d="M4 1L1 4l3 3V5h3V3H4V1z" />
  </svg>
);
