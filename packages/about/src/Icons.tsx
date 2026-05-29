import React from "react";

export const PixelFolderIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <path d="M1 3h4l2 2h8v8H1V3z" />
    <line x1="1" y1="5" x2="15" y2="5" />
  </svg>
);

export const PixelBackIcon = ({ className = "w-3 h-3 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 8 8" fill="currentColor">
    <path d="M4 1L1 4l3 3V5h3V3H4V1z" />
  </svg>
);

export const PixelBioIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <rect x="2" y="2" width="12" height="12" rx="1" />
    <line x1="5" y1="6" x2="11" y2="6" />
    <line x1="5" y1="9" x2="11" y2="9" />
  </svg>
);
