import React from 'react';
import { Layout as AntLayout } from 'antd';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Particles from './Particles';
import AppHeader from './AppHeader';

const { Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Pages that need full-width (admin, DAO)
  const isFullPage = ['/admin', '/dao'].includes(location.pathname);

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Particles />
      <Sidebar />

      {/* Main content area with sidebar offset on desktop */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: isFullPage ? 0 : 'var(--sidebar-width, 0px)' }}>
        <AppHeader />
        <Content style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          {children}
        </Content>
        <BottomNav />
      </div>
    </AntLayout>
  );
};

export default Layout;
