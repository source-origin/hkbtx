import { Buffer } from 'buffer';
window.Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc, bscTestnet, hardhat } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import App from './App';
import './index.css';

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

const hasValidWC = WALLETCONNECT_PROJECT_ID && !WALLETCONNECT_PROJECT_ID.startsWith('REPLACE');
if (!hasValidWC) {
  console.warn('[HKBTX] WalletConnect ProjectID 未设置，已禁用 WalletConnect 连接器。请在 .env 文件中配置 VITE_WALLETCONNECT_PROJECT_ID');
}

const connectors = [metaMask()];
if (hasValidWC) {
  connectors.push(walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }));
}
connectors.push(coinbaseWallet());

const config = createConfig({
  chains: [bsc, bscTestnet, hardhat],
  connectors,
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [hardhat.id]: http(),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#F7931A',
            accentColorForeground: '#070b1f',
            borderRadius: 'medium',
          })}
          locale="zh-CN"
          appInfo={{
            appName: 'HKBTX',
            learnMoreUrl: 'https://hkbtx.com',
          }}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
