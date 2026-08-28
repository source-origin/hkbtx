import React, { useState, useCallback } from 'react';
import { Button, InputNumber, Typography, message, Tag, Row, Col } from 'antd';
import { SwapOutlined, GiftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESSES } from '../contracts/address';
import { DRG_ABI, DRG_REDEEM_ABI } from '../utils/abi';
import PageShell from '../components/PageShell';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

const products = [
  { id: 'bronze', name: '青铜护盾', desc: 'HKBTX 护盾 × 1个月', drg: 1380, icon: '🛡️', color: '#cd7f32' },
  { id: 'silver', name: '白银护盾', desc: 'HKBTX 护盾 × 3个月装', drg: 4140, icon: '🛡️', color: '#c0c0c0' },
  { id: 'gold', name: '黄金护盾', desc: 'HKBTX 护盾 × 6个月装 + 限量 NFT', drg: 8280, icon: '🛡️', color: '#ffd700' },
];

const Redeem: React.FC = () => {
  const w = useWallet();
  const [drgAmount, setDrgAmount] = useState<number | null>(null);
  const [selProduct, setSelProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsApprove, setNeedsApprove] = useState(true);

  const approve = useCallback(async () => {
    if (!w.signer || !drgAmount) return;
    setLoading(true);
    try {
      const drg = new ethers.Contract(CONTRACT_ADDRESSES.DRG, DRG_ABI, w.signer);
      const tx = await drg.approve(CONTRACT_ADDRESSES.DRGRedeem, ethers.utils.parseEther(drgAmount.toString()));
      await tx.wait();
      setNeedsApprove(false);
      message.success('DRG 授权成功');
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setLoading(false); }
  }, [w.signer, drgAmount]);

  const redeem = useCallback(async () => {
    if (!w.signer || !drgAmount) return;
    setLoading(true);
    try {
      const redeemC = new ethers.Contract(CONTRACT_ADDRESSES.DRGRedeem, DRG_REDEEM_ABI, w.signer);
      const productId = products.findIndex(p => p.id === selProduct) + 1 || 1;
      const tx = await redeemC.redeem(productId, 1);
      await tx.wait();
      message.success('兑换成功！NFT 已发放至你的钱包');
      setDrgAmount(null);
      setSelProduct(null);
      w.refresh();
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setLoading(false); }
  }, [w.signer, drgAmount, w]);

  if (!w.isConnected) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <SwapOutlined style={{ fontSize: 48, color: 'var(--text-dim)' }} />
          <Title level={4} style={{ marginTop: 16, color: 'var(--text-primary)' }}>请先连接钱包</Title>
          <Text style={{ color: 'var(--text-secondary)' }}>连接钱包后使用 DRG 积分兑换产品</Text>
          <div style={{ marginTop: 20 }}>
            <button className="btn-primary-glow" onClick={w.connectWallet}><SwapOutlined /> 连接钱包</button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero */}
      <div className="hero fade-up-1">
        <div className="hero-icon">🔄</div>
        <Title level={2} style={{ color: 'var(--text-primary)' }}>
          <span className="text-drg">DRG</span> 兑换销毁
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          用 DRG 积分兑换产品 · DRG 将被销毁 · 链上铸造 NFT
        </Text>
      </div>

      {/* Products */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {products.map(p => (
          <GradientCard
            key={p.id}
            onClick={() => { setDrgAmount(p.drg); setSelProduct(p.id); setNeedsApprove(true); }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
              <Text strong style={{ display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</Text>
              <Text style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', margin: '4px 0' }}>{p.desc}</Text>
              <span className="tag tag-green" style={{ marginTop: 4 }}>{p.drg.toLocaleString()} DRG</span>
            </div>
          </GradientCard>
        ))}
      </div>

      {/* Redeem Form */}
      <GradientCard className="fade-up-3">
        <div className="flex-between mb-4">
          <Text strong style={{ color: 'var(--text-primary)' }}>兑换操作</Text>
          <span className="tag tag-green">DRG</span>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 12, marginBottom: 16 }}>
          <div className="flex-between">
            <Text style={{ color: 'var(--text-dim)', fontSize: 12 }}>消耗 DRG</Text>
            <Text style={{ color: 'var(--text-dim)', fontSize: 11 }}>
              余额: {Number(w.drgBalance).toLocaleString()} DRG
            </Text>
          </div>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            size="large"
            min={0}
            value={drgAmount}
            onChange={(v) => { setDrgAmount(v); setSelProduct(null); setNeedsApprove(true); }}
            placeholder="0"
            stringMode
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {['1380', '4140', '8280'].map(v => (
              <button key={v} className="btn-ghost" onClick={() => { setDrgAmount(Number(v)); setNeedsApprove(true); }}>
                {Number(v).toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="data-row">
          <span className="data-key">获得产品</span>
          <span className="data-val" style={{ color: 'var(--accent-teal)' }}>
            {products.find(p => p.drg === drgAmount)?.name || '自定义数量'}
          </span>
        </div>
        <div className="data-row">
          <span className="data-key">DRG 将销毁</span>
          <span className="data-val" style={{ color: '#ef4444' }}>🔥 {drgAmount ? drgAmount.toLocaleString() : '0'} DRG</span>
        </div>

        <div style={{ marginTop: 16 }}>
          {needsApprove && drgAmount ? (
            <button className="btn-accent" onClick={approve} disabled={loading} style={{ width: '100%' }}>
              {loading ? '⏳ 授权中...' : '✅ 1. 授权 DRG'}
            </button>
          ) : (
            <button className="btn-primary-glow" onClick={redeem} disabled={loading || !drgAmount} style={{ width: '100%' }}>
              {loading ? '⏳ 兑换中...' : `🛡️ 兑换${drgAmount ? ` · ${drgAmount.toLocaleString()} DRG` : ''}`}
            </button>
          )}
        </div>
      </GradientCard>

      {/* Info */}
      <GradientCard style={{ marginTop: 16 }}>
        <div className="flex-between mb-2">
          <Text strong style={{ color: 'var(--text-primary)' }}>销毁机制</Text>
          <span className="tag tag-red">DEFLATIONARY</span>
        </div>
        <div className="hairline" />
        <div className="data-row">
          <span className="data-key">🔥 DRG 销毁</span>
          <span className="data-val" style={{ color: 'var(--text-primary)' }}>兑换后立即销毁</span>
        </div>
        <div className="data-row">
          <span className="data-key">🖼️ 获得 NFT</span>
          <span className="data-val" style={{ color: 'var(--accent-cyan)' }}>链上铸造 · 可交易</span>
        </div>
        <div className="data-row">
          <span className="data-key">📦 实物发货</span>
          <span className="data-val" style={{ color: 'var(--text-secondary)' }}>NFT 持有者联系客服</span>
        </div>
      </GradientCard>
    </PageShell>
  );
};

export default Redeem;
