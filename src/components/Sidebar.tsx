import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, Tooltip } from 'antd';
import {
  HomeOutlined, DollarOutlined, SwapOutlined, TeamOutlined, WalletOutlined,
  CrownOutlined, SafetyCertificateOutlined, NodeIndexOutlined,
  SunOutlined, MoonOutlined,
} from '@ant-design/icons';
import { ThemeContext } from '../contexts/ThemeContext';

const { Text } = Typography;

const mainItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/staking', icon: <DollarOutlined />, label: '分红计划' },
  { key: '/swap', icon: <SwapOutlined />, label: '兑换' },
  { key: '/affiliate', icon: <TeamOutlined />, label: '推荐佣金' },
  { key: '/wallet', icon: <WalletOutlined />, label: '资产管理' },
];

const subItems = [
  { key: '/origin', icon: <NodeIndexOutlined />, label: 'ORIGIN-1', dot: true },
  { key: '/dao', icon: <CrownOutlined />, label: 'DAO 治理' },
  { key: '/admin', icon: <SafetyCertificateOutlined />, label: '管理后台' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = React.useContext(ThemeContext);

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className="desktop-sidebar desktop-only">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: 38, height: 38, 
          background: 'linear-gradient(135deg, #F7931A, #FFD700)', 
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: '#070b1f', fontWeight: 800, fontSize: 18,
          boxShadow: '0 0 20px rgba(247,147,26,0.3)',
        }}>H</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #F7931A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HKBTX</div>
          <Text style={{ fontSize: 10, color: 'var(--text-dim)' }}>香港BTC国际交易所 v7.1</Text>
        </div>
      </div>

      {/* Divider */}
      <div className="hairline" style={{ margin: '8px 0' }} />

      {/* Main Nav */}
      {mainItems.map(item => (
        <div key={item.key} className={`desktop-sidebar-item${isActive(item.key) ? ' active' : ''}`} onClick={() => navigate(item.key)}>
          {item.icon} <span>{item.label}</span>
        </div>
      ))}

      <div className="hairline" style={{ margin: '12px 0' }} />

      {/* Admin */}
      {subItems.map(item => (
        <div key={item.key} className={`desktop-sidebar-item${isActive(item.key) ? ' active' : ''}`} onClick={() => navigate(item.key)}
          style={item.dot && !isActive(item.key) ? { position: 'relative' } : undefined}>
          {item.icon} <span>{item.label}</span>
          {item.dot && !isActive(item.key) && (
            <span style={{
              position: 'absolute', right: 10, width: 7, height: 7,
              borderRadius: '50%', background: '#00d4aa',
              animation: 'pulse 1.5s infinite',
            }} />
          )}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <Tooltip title={isDark ? '切换亮色' : '切换暗色'}>
        <Button type="text" icon={isDark ? <SunOutlined /> : <MoonOutlined />} onClick={toggle}
          style={{ color: 'var(--text-dim)', fontSize: 18, marginBottom: 8 }} />
      </Tooltip>
      <Text style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', display: 'block' }}>
        © 2026 Origin Protocol
      </Text>
    </aside>
  );
};

export default Sidebar;
