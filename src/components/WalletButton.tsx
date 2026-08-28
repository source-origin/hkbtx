import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '../hooks/useWallet';

/**
 * RainbowKit ConnectButton wrapper
 * Delegates wallet UI to RainbowKit while keeping useWallet bridge active.
 */
const WalletButton: React.FC = () => {
  const w = useWallet();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <button className="wallet-btn" style={{ opacity: 0.6 }}>
              加载中...
            </button>
          );
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {connected ? (
              <>
                {chain.unsupported ? (
                  <button
                    onClick={openChainModal}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 14px', background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                      fontWeight: 600, fontSize: 12, border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    ⚠️ 错误网络
                  </button>
                ) : (
                  <button
                    onClick={openChainModal}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 14px', background: 'rgba(247,147,26,0.08)',
                      color: '#F7931A', fontWeight: 600, fontSize: 12,
                      border: '1px solid rgba(247,147,26,0.2)',
                      borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {chain.iconUrl && <img src={chain.iconUrl} alt="" style={{ width: 14, height: 14 }} />}
                    {chain.name || 'BSC'}
                  </button>
                )}

                <button className="wallet-btn" onClick={openAccountModal}>
                  🟢 {account.displayName}
                </button>
              </>
            ) : (
              <button className="wallet-btn" onClick={openConnectModal}>
                🔌 连接钱包
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletButton;
