import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

/**
 * GradientCard — Aerodrome-style glass card.
 * Gradient border glow on hover. Used for all content containers.
 */
const GradientCard: React.FC<Props> = ({ 
  children, 
  className = '', 
  style = {},
  hover = true,
  onClick,
}) => (
  <div
    className={`${hover ? 'glass-card' : 'glass-panel'} ${className}`}
    style={{ padding: 20, cursor: onClick ? 'pointer' : 'default', ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);

export default GradientCard;
