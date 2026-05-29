import React from "react";

export const PixelFolderIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <path d="M1 3h4l2 2h8v8H1V3z" />
    <line x1="1" y1="5" x2="15" y2="5" />
  </svg>
);

export const PixelBookIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <path d="M1 2h6v11H1V2z M9 2h6v11H9V2z" />
    <line x1="3" y1="5" x2="5" y2="5" />
    <line x1="3" y1="8" x2="5" y2="8" />
    <line x1="11" y1="5" x2="13" y2="5" />
    <line x1="11" y1="8" x2="13" y2="8" />
  </svg>
);

export const PixelPawIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <rect x="7" y="7" width="2" height="3" />
    <rect x="4" y="9" width="2" height="2" />
    <rect x="10" y="9" width="2" height="2" />
    <rect x="5" y="4" width="2" height="2" />
    <rect x="9" y="4" width="2" height="2" />
  </svg>
);
