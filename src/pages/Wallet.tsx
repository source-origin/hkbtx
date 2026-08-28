import React from 'react';
import { Button, Typography, Tag, Row, Col, message } from 'antd';
import {
  WalletOutlined, CopyOutlined, LogoutOutlined,
  DollarOutlined, GiftOutlined, FireOutlined,
} from '@ant-design/icons';
import { useWallet } from '../hooks/useWallet';
import { truncateAddress } from '../utils/helpers';
import { HLTH_TO_USD } from '../utils/prices';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

const WalletPage: React.FC = () => {
  const w = useWallet();

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); message.success('已复制'); } catch {}
  };

  if (!w.isConnected) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <WalletOutlined style={{ fontSize: 48, color: 'var(--text-dim)' }} />
          <Title level={4} style={{ marginTop: 16, color: 'var(--text-primary)' }}>未连接钱包</Title>
          <Text style={{ color: 'var(--text-secondary)' }}>请先连接 MetaMask 或 TokenPocket</Text>
          <div style={{ marginTop: 20 }}>
            <button className="btn-primary-glow" onClick={w.connectWallet}><WalletOutlined /> 连接钱包</button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero */}
      <div className="hero fade-up-1">
        <div className="hero-icon">💼</div>
        <Title level={2} style={{ color: 'var(--text-primary)' }}>资产管理</Title>
      </div>

      {/* Account Card */}
      <GradientCard className="fade-up-2">
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F7931A, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 18,
              boxShadow: '0 0 16px rgba(247,147,26,0.3)',
            }}>
              {w.account?.slice(2, 4).toUpperCase() || '?'}
            </div>
            <div>
              <Text strong style={{ fontSize: 16, fontFamily: 'SF Mono, Consolas, monospace', color: 'var(--text-primary)' }}>
                {truncateAddress(w.account!)}
              </Text>
              <br />
              <span className="tag tag-cyan">
                {w.isLocalDev ? '🖥️ 本地' : w.isCorrectChain ? '🔗 BSC' : `⚠️ ID:${w.chainId}`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost" onClick={() => copy(w.account!)}><CopyOutlined /></button>
            <button className="btn-danger" onClick={w.disconnect}><LogoutOutlined /></button>
          </div>
        </div>
        {!w.isCorrectChain && !w.isLocalDev && (
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={w.switchToBSC} style={{ width: '100%' }}>
              切换到 BSC 主网
            </button>
          </div>
        )}
      </GradientCard>

      {/* Token Balances */}
      <Row gutter={[10, 10]} style={{ marginTop: 16 }} className="fade-up-3">
        <Col span={8}>
          <StatCard label="BNB" value={Number(w.bnbBalance)} decimals={4} accent="bnb" icon={<DollarOutlined />} />
        </Col>
        <Col span={8}>
          <StatCard label="DRG 积分" value={Number(w.drgBalance)} decimals={0} accent="drg" icon={<GiftOutlined />} />
        </Col>
        <Col span={8}>
          <StatCard label="HLTH 治理" value={Number(w.hlthBalance)} decimals={2} suffix={` ≈ $${(Number(w.hlthBalance) * HLTH_TO_USD).toFixed(2)}`} accent="hlth" icon={<FireOutlined />} />
        </Col>
      </Row>

      {/* Token Details */}
      <GradientCard style={{ marginTop: 16 }}>
        <div className="section-title mb-4">代币详情</div>
        <div className="data-row">
          <span className="data-key"><span className="token-dot bnb" /> BNB Chain</span>
          <span className="data-val">{Number(w.bnbBalance).toFixed(4)} BNB</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key"><span className="token-dot drg" /> DRG 积分</span>
          <span className="data-val" style={{ color: 'var(--token-drg)' }}>{Number(w.drgBalance).toLocaleString()} DRG</span>
        </div>
        <div className="data-row">
          <span className="data-key"><span className="token-dot hlth" /> HLTH 治理代币</span>
          <span className="data-val" style={{ color: 'var(--token-hlth)' }}>{Number(w.hlthBalance).toLocaleString()} HLTH ≈ ${(Number(w.hlthBalance) * HLTH_TO_USD).toLocaleString()}</span>
        </div>
      </GradientCard>

      {/* Quick Actions */}
      <GradientCard style={{ marginTop: 16 }}>
        <div className="section-title mb-4">快捷操作</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" onClick={w.refresh} style={{ flex: 1 }}>🔄 刷新余额</button>
          <button className="btn-glass" onClick={() => copy(w.account!)} style={{ flex: 1 }}>📋 复制地址</button>
        </div>
      </GradientCard>
    </PageShell>
  );
};

export default WalletPage;
