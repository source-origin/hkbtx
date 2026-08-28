import React, { useState, useCallback, useEffect } from 'react';
import { Row, Col, InputNumber, Typography } from 'antd';
import {
  DollarOutlined, LockOutlined, UnlockOutlined, GiftOutlined, ClockCircleOutlined,
  ThunderboltOutlined, FireOutlined, WalletOutlined,
} from '@ant-design/icons';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useContractData } from '../hooks/useContractData';
import { CONTRACT_ADDRESSES } from '../contracts/address';
import { STAKING_ABI, HLTH_ABI } from '../utils/abi';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

const Staking: React.FC = () => {
  const w = useWallet();
  const cd = useContractData(w.provider, w.account, w.chainId);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [activeMode, setActiveMode] = useState<'stake' | 'unstake'>('stake');

  useEffect(() => {
    if (w.provider && w.account && w.chainId) {
      const hlth = new ethers.Contract(CONTRACT_ADDRESSES.TokenHLTH, HLTH_ABI, w.provider);
      hlth.allowance(w.account, CONTRACT_ADDRESSES.Staking).then((a: ethers.BigNumber) => {
        setNeedsApproval(a.isZero());
      }).catch(() => {});
    }
  }, [w.provider, w.account, w.chainId]);

  const doAction = useCallback(async (action: 'approve' | 'stake' | 'unstake' | 'claim') => {
    if (!w.signer || !w.provider) return;
    setLoading(true);
    try {
      if (action === 'approve') {
        const hlth = new ethers.Contract(CONTRACT_ADDRESSES.TokenHLTH, HLTH_ABI, w.signer);
        const tx = await hlth.approve(CONTRACT_ADDRESSES.Staking, ethers.utils.parseEther(amount?.toString() || '0'));
        await tx.wait();
        setNeedsApproval(false);
        (window as any).message?.success?.('✅ 授权成功');
      } else if (action === 'stake') {
        const staking = new ethers.Contract(CONTRACT_ADDRESSES.Staking, STAKING_ABI, w.signer);
        const tx = await staking.stake(ethers.utils.parseEther(amount?.toString() || '0'));
        await tx.wait();
        (window as any).message?.success?.(`✅ 质押 ${amount} HLTH 成功 · 分红收益已开启`);
        setAmount(null);
      } else if (action === 'unstake') {
        const staking = new ethers.Contract(CONTRACT_ADDRESSES.Staking, STAKING_ABI, w.signer);
        const tx = await staking.unstake(ethers.utils.parseEther(amount?.toString() || '0'));
        await tx.wait();
        (window as any).message?.success?.(`✅ 解押 ${amount} HLTH 成功`);
        setAmount(null);
      } else if (action === 'claim') {
        const staking = new ethers.Contract(CONTRACT_ADDRESSES.Staking, STAKING_ABI, w.signer);
        const tx = await staking.claimReward();
        await tx.wait();
        (window as any).message?.success?.('🎉 分红已领取! USDT 已到账');
      }
      w.refresh();
    } catch (e: any) { (window as any).message?.error?.(e.message?.slice(0, 200)); }
    finally { setLoading(false); }
  }, [w.signer, amount, w]);

  const dailyYield = amount ? ((amount * Number(cd.stakingApr)) / 36500).toFixed(2) : '0.00';
  const weeklyYield = amount ? ((amount * Number(cd.stakingApr) * 7) / 36500).toFixed(2) : '0.00';

  const btnClass = (v: string) => activeMode === v ? 'btn-tab-active' : 'btn-tab';

  if (!w.isConnected) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div className="hero-icon">💰</div>
          <Title level={3} style={{ marginTop: 16, color: 'var(--text-primary)' }}>连接钱包</Title>
          <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 24 }}>
            连接钱包后参与 <span style={{ color: 'var(--token-hlth)' }}>HLTH 分红计划</span>
          </Text>
          <button className="btn-primary-glow" onClick={w.connectWallet}>
            <WalletOutlined /> 连接钱包
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero */}
      <div className="hero fade-up-1">
        <div className="hero-icon">💰</div>
        <Title level={2} style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
          <span className="text-hlth">HLTH</span> 分红计划
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          锁仓 HLTH · 每日 USDT + HLTH 双重分红 · 7天周期
        </Text>
      </div>

      {/* Stats Row */}
      <Row gutter={[8, 8]} className="fade-up-2" style={{ marginBottom: 20 }}>
        <Col span={6}>
          <StatCard
            label="年化收益率"
            value={cd.loading ? 0 : Number(cd.stakingApr)}
            decimals={1}
            suffix="%"
            accent="gold"
            icon={<ThunderboltOutlined />}
          />
        </Col>
        <Col span={6}>
          <StatCard
            label="总锁仓量"
            value={cd.loading ? 0 : Number(cd.totalStaked)}
            decimals={0}
            suffix=" HLTH"
            accent="hlth"
            icon={<LockOutlined />}
          />
        </Col>
        <Col span={6}>
          <StatCard
            label="锁仓周期"
            value={7}
            decimals={0}
            suffix=" 天"
            accent="cyan"
            icon={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <StatCard
            label="累计分红"
            value={0}
            decimals={2}
            suffix=" USDT"
            accent="teal"
            icon={<GiftOutlined />}
          />
        </Col>
      </Row>

      {/* Mode Toggle */}
      <div className="fade-up-2" style={{
        display: 'flex', gap: 4, marginBottom: 16,
        background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 4,
      }}>
        <button className={btnClass('stake')} onClick={() => setActiveMode('stake')}>
          <LockOutlined /> 质押锁仓
        </button>
        <button className={btnClass('unstake')} onClick={() => setActiveMode('unstake')}>
          <UnlockOutlined /> 解押提取
        </button>
      </div>

      {/* Main Action Panel */}
      <GradientCard className="fade-up-3">
        <div className="flex-between mb-3">
          <Text strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
            {activeMode === 'stake' ? '📥 质押锁仓' : '📤 解除质押'}
          </Text>
          <span className="tag tag-purple">HLTH</span>
        </div>

        {/* Amount Input */}
        <div className="input-group">
          <div className="flex-between mb-1">
            <Text style={{ color: 'var(--text-dim)', fontSize: 12 }}>输入数量</Text>
            <Text style={{ color: 'var(--text-dim)', fontSize: 11 }}>
              余额: <span className="text-hlth" style={{ fontWeight: 600 }}>{Number(w.hlthBalance).toLocaleString()}</span> HLTH
            </Text>
          </div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <InputNumber
              className="input-number-glow"
              style={{ width: '100%' }}
              size="large"
              min={0}
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              stringMode
            />
            <button
              className="btn-glass-sm"
              style={{ position: 'absolute', right: 8, top: 8, fontSize: 11 }}
              onClick={() => setAmount(Number(w.hlthBalance))}
            >
              MAX
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[25, 50, 75].map(pct => (
              <button
                key={pct}
                className="btn-chip"
                onClick={() => setAmount(Number(w.hlthBalance) * pct / 100)}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Yield Preview */}
        <div className="yield-preview">
          <div className="flex-between">
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>📊 预估日分红</span>
            <span className="text-mono" style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 700 }}>
              ~{dailyYield} USDT
            </span>
          </div>
          <div className="flex-between" style={{ marginTop: 4 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>📅 预估周分红</span>
            <span className="text-mono" style={{ color: '#00ffd1', fontSize: 14, fontWeight: 700 }}>
              ~{weeklyYield} USDT
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {activeMode === 'stake' ? (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {needsApproval && amount ? (
              <button
                className="btn-accent"
                onClick={() => doAction('approve')}
                disabled={loading}
              >
                {loading ? '⏳ 授权中...' : '✅ 1. 授权 HLTH'}
              </button>
            ) : (
              <button
                className="btn-primary-glow"
                onClick={() => doAction('stake')}
                disabled={loading || !amount}
              >
                {loading ? '⏳ 质押中...' : `💰 质押 ${amount ? amount.toLocaleString() + ' HLTH' : 'HLTH'}`}
              </button>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <button
              className="btn-accent"
              onClick={() => doAction('unstake')}
              disabled={loading || !amount}
              style={{ width: '100%' }}
            >
              {loading ? '⏳ 解押中...' : '🔓 解押提取'}
            </button>
            <button
              className="btn-outline"
              onClick={() => doAction('claim')}
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              <GiftOutlined /> 🎁 领取累计分红
            </button>
          </div>
        )}
      </GradientCard>

      {/* Rewards Info */}
      <GradientCard style={{ marginTop: 14 }} className="fade-up-4">
        <div className="flex-between mb-3">
          <Text strong style={{ color: 'var(--text-primary)' }}>📊 分红规则</Text>
          <span className="tag tag-cyan">双重分红</span>
        </div>
        <div className="hairline" style={{ margin: '12px 0' }} />
        <div className="info-row">
          <span className="info-icon">🔒</span>
          <div>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>锁仓周期</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, display: 'block' }}>7天（168小时），到期后可随时解押</span>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon">💎</span>
          <div>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>分红来源</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, display: 'block' }}>协议收入 + 兑换手续费 + 推荐佣金</span>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon">🪙</span>
          <div>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>分红币种</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, display: 'block' }}>
              <span className="token-dot usdt" /> USDT (稳定币) + <span className="token-dot hlth" /> HLTH (治理代币)
            </span>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon">⚠️</span>
          <div>
            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>提前解押惩罚</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, display: 'block' }}>丧失当期累计未领分红</span>
          </div>
        </div>
      </GradientCard>
    </PageShell>
  );
};

export default Staking;
