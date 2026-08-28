import React, { useState, useCallback } from 'react';
import { Button, Input, Typography, message, Tag, Row, Col } from 'antd';
import { TeamOutlined, LinkOutlined, CopyOutlined, GiftOutlined, CrownOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useContractData } from '../hooks/useContractData';
import { CONTRACT_ADDRESSES } from '../contracts/address';
import { REFERRAL_TREE_ABI } from '../utils/abi';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

// ── 统一亮色文字样式 ──
const labelStyle: React.CSSProperties = { color: '#c0cdf0', fontWeight: 600, fontSize: 13 };
const strongStyle: React.CSSProperties = { color: '#ffffff', fontWeight: 700, fontSize: 15 };
const valueStyle: React.CSSProperties = { color: '#ffffff', fontWeight: 600, fontSize: 14 };

const Affiliate: React.FC = () => {
  const w = useWallet();
  const cd = useContractData(w.provider, w.account, w.chainId);
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState('');

  const refLink = w.account ? `${window.location.origin}/?ref=${w.account}` : '';

  const copyLink = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    message.success('推荐链接已复制');
  };

  const claim = useCallback(async () => {
    if (!w.signer) return;
    setLoading(true);
    try {
      const ref = new ethers.Contract(CONTRACT_ADDRESSES.ReferralTreeV2, REFERRAL_TREE_ABI, w.signer);
      const tx = await ref.claimCommissions();
      await tx.wait();
      message.success('佣金已领取');
      w.refresh();
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setLoading(false); }
  }, [w.signer, w]);

  if (!w.isConnected) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <TeamOutlined style={{ fontSize: 48, color: 'var(--text-dim)' }} />
          <Title level={4} style={{ marginTop: 16, color: '#ffffff' }}>请先连接钱包</Title>
          <span style={{ color: '#c0cdf0', fontSize: 14 }}>连接钱包后查看推荐佣金</span>
          <div style={{ marginTop: 20 }}>
            <button className="btn-primary-glow" onClick={w.connectWallet}><TeamOutlined /> 连接钱包</button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero */}
      <div className="hero fade-up-1">
        <div className="hero-icon">🌳</div>
        <Title level={2} style={{ color: '#ffffff' }}>
          <span style={{ color: 'var(--token-hlth)' }}>推荐</span>佣金
        </Title>
        <span style={{ color: '#c0cdf0', fontSize: 14 }}>
          3层直推 · 团队业绩奖 · 多代分红 · 直接到账 USDT
        </span>
      </div>

      {/* Stats */}
      <Row gutter={[10, 10]} className="fade-up-2" style={{ marginBottom: 20 }}>
        <Col span={12}>
          <StatCard
            label="待领佣金"
            value={Number(cd.referralPendingCommissions)}
            decimals={2}
            suffix=" USDT"
            accent="usdt"
            icon={<GiftOutlined />}
          />
        </Col>
        <Col span={12}>
          <StatCard
            label="团队人数"
            value={0}
            decimals={0}
            accent="cyan"
            icon={<TeamOutlined />}
          />
        </Col>
      </Row>

      {/* Referral Link */}
      <GradientCard className="fade-up-3">
        <div className="flex-between mb-4">
          <span style={strongStyle}>我的推荐链接</span>
          <span className="tag tag-purple">REFERRAL</span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, fontFamily: 'SF Mono, Consolas, monospace', fontSize: 13, color: '#c0cdf0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {refLink || '连接钱包后生成'}
          </span>
          <button className="btn-outline" onClick={copyLink}><CopyOutlined /> 复制</button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button className="btn-primary-glow" onClick={claim} disabled={loading} style={{ flex: 1 }}>
            <GiftOutlined /> {loading ? '⏳ 领取中...' : '💰 领取佣金'}
          </button>
        </div>
      </GradientCard>

      {/* Commission Model: 三块 */}
      <GradientCard style={{ marginTop: 16 }}>
        <div className="flex-between mb-4">
          <span style={strongStyle}>① 直接推荐 · 一级返利</span>
          <span className="tag tag-green">DIRECT</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key">💰 返利/佣金</span>
          <span style={{ ...valueStyle, color: 'var(--accent-teal)', fontSize: 18 }}>40%</span>
        </div>
        <div className="data-row">
          <span className="data-key">📌 说明</span>
          <span style={{ color: '#9bafd0', fontSize: 12 }}>直接推荐用户交易，您获得交易额返利</span>
        </div>
      </GradientCard>

      <GradientCard style={{ marginTop: 16 }}>
        <div className="flex-between mb-4">
          <span style={strongStyle}>② 小区业绩 · 团队奖励</span>
          <span className="tag tag-purple">TEAM</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key">🏆 额外奖励</span>
          <span style={{ ...valueStyle, color: 'var(--accent-cyan)', fontSize: 18 }}>10%</span>
        </div>
        <div className="data-row">
          <span className="data-key">📌 说明</span>
          <span style={{ color: '#9bafd0', fontSize: 12 }}>团队业绩达标后，按「小市场」业绩提取奖励</span>
        </div>
      </GradientCard>

      <GradientCard style={{ marginTop: 16 }}>
        <div className="flex-between mb-4">
          <span style={strongStyle}>③ 直推代数 · 多代分红</span>
          <span className="tag tag-cyan">3代</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key"><span className="token-dot hlth" /> 第一代</span>
          <span style={{ ...valueStyle, color: 'var(--accent-teal)' }}>50%</span>
        </div>
        <div className="data-row">
          <span className="data-key"><span className="token-dot hlth" /> 第二代</span>
          <span style={{ ...valueStyle, color: 'var(--accent-cyan)' }}>30%</span>
        </div>
        <div className="data-row">
          <span className="data-key"><span className="token-dot hlth" /> 第三代</span>
          <span style={{ ...valueStyle, color: '#9bafd0' }}>20%</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key">💡 规则</span>
          <span style={{ color: '#9bafd0', fontSize: 12 }}>按推荐链逐代递减，各代独立计算</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key">💰 结算币种</span>
          <span style={valueStyle}><span className="token-dot usdt" /> USDT</span>
        </div>
      </GradientCard>

      {/* Bind Referrer */}
      <GradientCard style={{ marginTop: 16 }}>
        <div className="flex-between mb-4">
          <span style={strongStyle}>绑定推荐人</span>
          <span className="tag tag-green">BIND</span>
        </div>
        <div className="flex-between gap-2" style={{ gap: 10 }}>
          <input
            className="input-glass"
            style={{ flex: 1, color: '#ffffff' }}
            value={refId}
            onChange={e => setRefId(e.target.value)}
            placeholder="输入推荐人地址 0x..."
          />
          <button className="btn-accent" disabled={loading || !refId} onClick={async () => {
            if (!w.signer || !refId) return;
            setLoading(true);
            try {
              const ref = new ethers.Contract(CONTRACT_ADDRESSES.ReferralTreeV2, REFERRAL_TREE_ABI, w.signer);
              const tx = await ref.registerReferral(refId);
              await tx.wait();
              message.success('推荐人绑定成功');
              setRefId('');
              w.refresh();
            } catch (e: any) { message.error(e.message?.slice(0, 200)); }
            finally { setLoading(false); }
          }}>🔗 绑定</button>
        </div>
      </GradientCard>
    </PageShell>
  );
};

export default Affiliate;
