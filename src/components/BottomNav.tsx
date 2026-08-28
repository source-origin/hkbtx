import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  DollarOutlined,
  SwapOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const items: NavItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'staking', icon: <DollarOutlined />, label: '分红', path: '/staking' },
  { key: 'swap', icon: <SwapOutlined />, label: '兑换', path: '/swap' },
  { key: 'affiliate', icon: <TeamOutlined />, label: '推荐', path: '/affiliate' },
  { key: 'wallet', icon: <WalletOutlined />, label: '资产', path: '/wallet' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav mobile-only">
      {items.map(item => {
        const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
        return (
          <div
            key={item.key}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default BottomNav;
