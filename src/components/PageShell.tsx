import React from 'react';

interface Props {
  children: React.ReactNode;
  wide?: boolean;
  full?: boolean;
  className?: string;
}

/**
 * PageShell — Wraps every page with entry animation + responsive container.
 * Aave-style content layering: can be narrow (520px mobile), wide (960px), or full.
 */
const PageShell: React.FC<Props> = ({ children, wide, full, className = '' }) => (
  <div
    className={`page-container ${wide ? 'wide' : ''} ${full ? 'full' : ''} page-enter ${className}`}
  >
    {children}
  </div>
);

export default PageShell;
