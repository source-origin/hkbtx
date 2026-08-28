import React from 'react';
import AnimatedNumber from './AnimatedNumber';

interface Props {
  label: string;
  value: number | string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  accent?: 'drg' | 'hlth' | 'usdt' | 'bnb' | 'cyan' | 'default';
  change?: { value: number; positive: boolean };
  sparkline?: 'drg' | 'hlth' | 'usdt' | 'cyan';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * StatCard — Pendle-style stat card with glass effect.
 * Hover lift + glow + accent color ring.
 */
const StatCard: React.FC<Props> = ({
  label,
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  accent = 'default',
  change,
  sparkline,
  icon,
  className = '',
  style = {},
}) => {
  const accentClass = accent !== 'default' ? `accent-${accent}` : '';

  return (
    <div className={`stat-card ${accentClass} ${className}`} style={style}>
      <div className="flex-between">
        <span className="stat-label">{label}</span>
        {icon && <span style={{ color: 'var(--text-dim)', fontSize: 16 }}>{icon}</span>}
      </div>
      <div
        className="stat-value"
        style={{
          color:
            accent === 'drg' ? 'var(--token-drg)' :
            accent === 'hlth' ? 'var(--token-hlth)' :
            accent === 'usdt' ? 'var(--token-usdt)' :
            accent === 'bnb' ? 'var(--token-bnb)' :
            accent === 'cyan' ? 'var(--accent-cyan)' :
            'var(--text-primary)',
        }}
      >
        <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
      </div>
      {change && (
        <div className={`stat-change ${change.positive ? 'up' : 'down'}`}>
          {change.positive ? '▲' : '▼'} {Math.abs(change.value)}%
        </div>
      )}
      {sparkline && <div className={`sparkline ${sparkline}`} />}
    </div>
  );
};

export default StatCard;
