import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antTheme, App as AntApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import { useWallet } from './hooks/useWallet';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Staking = lazy(() => import('./pages/Staking'));
const Swap = lazy(() => import('./pages/Swap'));
const Affiliate = lazy(() => import('./pages/Affiliate'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Redeem = lazy(() => import('./pages/Redeem'));

// Admin/DAO stubs (Admin now accepts wallet props via wrapper)
const Admin = lazy(() => import('./pages/Admin'));
const DAO = lazy(() => import('./pages/DAO'));
const Origin = lazy(() => import('./pages/Origin'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

const App: React.FC = () => {
  // Wallet state (shared across pages)
  const wallet = useWallet();

  // Compute theme dynamically
  const [isDark, setIsDark] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('theme');
      if (saved) setIsDark(saved === 'dark');
    };
    window.addEventListener('storage', handleStorage);
    // Sync with ThemeProvider
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme');
      if (current) setIsDark(current === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { window.removeEventListener('storage', handleStorage); observer.disconnect(); };
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#F7931A',
          colorSuccess: '#22c55e',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          borderRadius: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC", sans-serif',
        },
      }}
    >
      <AntApp>
        <ThemeProvider>
          <BrowserRouter>
            <Layout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/origin" element={<Origin />} />
                  <Route path="/staking" element={<Staking />} />
                  <Route path="/swap" element={<Swap />} />
                  <Route path="/affiliate" element={<Affiliate />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/redeem" element={<Redeem />} />
                  <Route path="/admin" element={
                    <Suspense fallback={<Loading />}>
                      <Admin
                        provider={wallet.provider}
                        account={wallet.account}
                        chainId={wallet.chainId}
                        isConnected={wallet.isConnected}
                      />
                    </Suspense>
                  } />
                  <Route path="/dao" element={
                    <Suspense fallback={<Loading />}>
                      <DAO
                        provider={wallet.provider}
                        account={wallet.account}
                        chainId={wallet.chainId}
                        isConnected={wallet.isConnected}
                        hlthBalance={wallet.hlthBalance}
                      />
                    </Suspense>
                  } />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </ThemeProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
