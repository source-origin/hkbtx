import React from 'react';

interface Props {
  token: 'drg' | 'hlth' | 'usdt' | 'bnb';
  amount: string;
  icon?: React.ReactNode;
  className?: string;
}

const TOKEN_SYMBOLS: Record<string, string> = {
  drg: 'DRG', hlth: 'HLTH', usdt: 'USDT', bnb: 'BNB',
};

/**
 * TokenBadge — Color-coded token chip.
 * Matches the token color system from design-system.css
 */
const TokenBadge: React.FC<Props> = ({ token, amount, icon, className = '' }) => (
  <span className={`token-badge ${token} ${className}`}>
    {icon && icon}
    <span className={`token-dot ${token}`} />
    <span>{amount}</span>
    <span style={{ opacity: 0.6, fontSize: 10 }}>{TOKEN_SYMBOLS[token]}</span>
  </span>
);

export default TokenBadge;
