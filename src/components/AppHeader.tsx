import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { ThemeContext } from '../contexts/ThemeContext';
import WalletButton from './WalletButton';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggle } = React.useContext(ThemeContext);

  return (
    <header className="app-header">
      <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #F7931A, #FFD700)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#070b1f', fontWeight: 800, fontSize: 14,
          boxShadow: '0 0 12px rgba(247,147,26,0.3)',
        }}>H</div>
        <span style={{ 
          fontWeight: 700, fontSize: 15,
          background: 'linear-gradient(135deg, #F7931A, #FFD700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>HKBTX</span>
      </div>

      <div className="desktop-only" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dim)' }}>
        🛡️ HKBTX · 香港BTC国际交易所 v7.1
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button className="mobile-only" type="text" icon={isDark ? <SunOutlined /> : <MoonOutlined />} onClick={toggle}
          style={{ color: 'var(--text-dim)' }} />
        <WalletButton />
      </div>
    </header>
  );
};

export default AppHeader;
