import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Tag, Typography, Space, Input, message, Spin, Table, Statistic, Tabs } from 'antd';
import {
  NodeIndexOutlined, ThunderboltOutlined, LinkOutlined, BlockOutlined,
  SendOutlined, ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined,
  SafetyCertificateOutlined, ApiOutlined, LockOutlined, UnlockOutlined,
} from '@ant-design/icons';
import { useWallet } from '../hooks/useWallet';
import GradientCard from '../components/GradientCard';

const { Text, Title, Paragraph } = Typography;

// ORIGIN-1 RPC：自动检测主机地址（适配IP变化）
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const HOST = isLocalhost ? 'localhost' : (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const SEED_RPC = `http://${HOST}:3001`;
const LIGHT_RPC = `http://${HOST}:3002`;
const MOBILE_PAGE = `http://${HOST}:3001`;

interface NodeStatus {
  name: string;
  node_id: string;
  height: number;
  peers: number;
  is_seed: boolean;
  chain_id: string;
  constitution_article_0: string;
  token: { name: string; symbol: string; decimals: number; total_supply: string };
  latency?: number;
  online: boolean;
}

interface BlockInfo {
  index: number;
  hash: string;
  timestamp: string;
  data: any;
}

interface ValidatorInfo {
  address: string;
  stake_uyuan: string;
  stake_readable: string;
}

const OriginPage: React.FC = () => {
  const w = useWallet();
  const [seedStatus, setSeedStatus] = useState<NodeStatus | null>(null);
  const [lightStatus, setLightStatus] = useState<NodeStatus | null>(null);
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 链上活跃地址预设
  const CHAIN_ADDRESSES = [
    { label: 'HKBTC-pi-QGo (38 YUAN, 验证者)', value: 'HKBTC-pi-QGo' },
    { label: 'HKBTC·π·量子总督 (10 YUAN)', value: 'HKBTC·π·量子总督' },
    { label: 'Mobile-Miner (6 YUAN, 验证者)', value: 'Mobile-Miner' },
    { label: 'bob (0.5 YUAN, 验证者)', value: 'bob' },
  ];

  // DPoS 交易表单 — fromAddr 自动跟随钱包地址
  const [fromAddr, setFromAddr] = useState('');
  const [formManual, setFormManual] = useState(false); // 用户手动修改后不再自动覆盖
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txResult, setTxResult] = useState<{ success: boolean; msg: string } | null>(null);

  // 自动填充钱包地址到 fromAddr
  useEffect(() => {
    if (w.account && !formManual) {
      setFromAddr(w.account);
    }
  }, [w.account, formManual]);

  const fetchNodeStatus = useCallback(async (rpc: string): Promise<NodeStatus | null> => {
    try {
      const start = Date.now();
      const res = await fetch(`${rpc}/status`);
      const data = await res.json();
      return { ...data, latency: Date.now() - start, online: true };
    } catch {
      return null;
    }
  }, []);

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch(`${SEED_RPC}/chain`);
      const data = await res.json();
      setBlocks((data.blocks || []).slice(-10).reverse());
    } catch {}
  }, []);

  const fetchValidators = useCallback(async () => {
    try {
      const res = await fetch(`${SEED_RPC}/validators`);
      const data = await res.json();
      setValidators(data.validators || []);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    const [seed, light] = await Promise.all([
      fetchNodeStatus(SEED_RPC),
      fetchNodeStatus(LIGHT_RPC),
    ]);
    setSeedStatus(seed);
    setLightStatus(light);
    fetchBlocks();
    fetchValidators();
  }, [fetchNodeStatus, fetchBlocks, fetchValidators]);

  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh, autoRefresh]);

  // 通用交易提交
  const sendBlockAction = async (action: string, extra: Record<string, string> = {}) => {
    if (!fromAddr.trim()) {
      message.warning('请输入发送方地址 (from)');
      return;
    }
    if ((action === 'transfer' || action === 'stake') && (!toAddr.trim() || !amount.trim())) {
      message.warning('转账/质押需要填写接收方地址和金额');
      return;
    }
    if (action === 'unstake' && !amount.trim()) {
      message.warning('解质押需要填写金额');
      return;
    }
    setLoading(true);
    setTxResult(null);
    try {
      const body: any = { action, from: fromAddr, ts: new Date().toISOString(), ...extra };
      if (action === 'transfer') {
        body.amount = amount;
        body.to = toAddr;
      } else if (action === 'stake' || action === 'unstake') {
        body.amount = amount;
        body.to = fromAddr;
      }
      const res = await fetch(`${SEED_RPC}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setTxHash(data.block.hash);
        setTxResult({ success: true, msg: `${action} 成功！Block #${data.block.index}` });
        message.success(`🌌 ${action.toUpperCase()} · Block #${data.block.index} ✅`);
        // 清空金额
        if (action !== 'transfer') setAmount('');
        setTimeout(refresh, 1500);
      } else {
        setTxResult({ success: false, msg: data.error || '上链失败' });
        message.error(data.error || '上链失败');
      }
    } catch (e: any) {
      setTxResult({ success: false, msg: `网络错误: ${e.message}` });
      message.error(`网络错误: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderNodeCard = (node: NodeStatus | null, title: string, rpc: string, isSeed: boolean) => (
    <GradientCard key={title}>
      <Card
        bordered={false}
        style={{ background: 'transparent' }}
        title={
          <Space>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: node?.online ? '#22c55e' : '#ef4444',
              boxShadow: `0 0 8px ${node?.online ? '#22c55e' : '#ef4444'}`,
              animation: node?.online ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
            {isSeed && <Tag color="gold" icon={<SafetyCertificateOutlined />}>种子节点</Tag>}
            {!isSeed && <Tag color="blue">轻节点</Tag>}
          </Space>
        }
      >
        {node?.online ? (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <Statistic title="高度" value={node.height} prefix={<BlockOutlined />} valueStyle={{ color: '#00d4aa', fontWeight: 700 }} />
              <Statistic title="对等节点" value={node.peers} prefix={<NodeIndexOutlined />} valueStyle={{ fontWeight: 700 }} />
              <Statistic title="延迟" value={`${node.latency}ms`} prefix={<ThunderboltOutlined />} valueStyle={{ color: node.latency && node.latency < 50 ? '#22c55e' : '#f59e0b', fontWeight: 700 }} />
            </div>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
              NodeID: {node.node_id.slice(0, 16)}... | RPC: {rpc}
            </Text>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <PauseCircleOutlined style={{ fontSize: 32, color: '#ef4444' }} />
            <div style={{ marginTop: 8, color: '#ef4444' }}>节点离线</div>
          </div>
        )}
      </Card>
    </GradientCard>
  );

  const blockColumns = [
    { title: '#', dataIndex: 'index', key: 'index', width: 50, render: (v: number) => <Tag color="cyan" style={{ fontFamily: 'monospace' }}>#{v}</Tag> },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: any, r: BlockInfo) => (
        <Tag color={r.index === 0 ? 'gold' : (r.data?.action === 'stake' ? 'green' : r.data?.action === 'mine' ? 'geekblue' : (r.data?.action === 'transfer' ? 'orange' : 'purple'))}>
          {r.data?.action || '创世'}
        </Tag>
      ),
    },
    {
      title: '详情', key: 'data',
      render: (_: any, r: BlockInfo) => (
        <Text style={{ fontSize: 12 }}>
          {r.index === 0
            ? (r.data?.constitution_article_0 || '创世区块').slice(0, 40) + '...'
            : r.data?.action === 'transfer'
              ? `${r.data.from?.slice(0,8)} → ${r.data.to?.slice(0,8)} ${(Number(r.data.amount||0)/1000000).toFixed(2)} YUAN`
              : r.data?.action === 'stake'
              ? `质押 ${(Number(r.data.amount||0)/1000000).toFixed(2)} YUAN`
              : r.data?.action === 'mine'
              ? `挖矿 +1 YUAN → ${r.data.to?.slice(0,8)}`
              : (r.data?.message || JSON.stringify(r.data).slice(0, 50))}
        </Text>
      ),
    },
    {
      title: '哈希', dataIndex: 'hash', key: 'hash', width: 120,
      render: (v: string) => <Text code style={{ fontSize: 10 }}>{v.slice(0, 16)}...</Text>,
    },
    {
      title: '时间', dataIndex: 'timestamp', key: 'ts', width: 80,
      render: (v: string) => <Text style={{ fontSize: 10 }} type="secondary">{new Date(v).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>,
    },
  ];

  const validatorColumns = [
    {
      title: '排名', key: 'rank', width: 50,
      render: (_: any, __: any, idx: number) => <Tag color="gold" style={{ fontFamily: 'monospace' }}>#{idx + 1}</Tag>,
    },
    { title: '地址', dataIndex: 'address', key: 'address', render: (v: string) => <Text code style={{ fontSize: 10 }}>{v.slice(0, 16)}...</Text> },
    { title: '质押量', dataIndex: 'stake_readable', key: 'stake', render: (v: string) => <Text strong style={{ color: '#00d4aa' }}>{v}</Text> },
  ];

  const tabItems = [
    {
      key: 'tx',
      label: '⚡ 交易',
      children: (
        <div>
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {/* 预设链上地址快速选择 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
              {CHAIN_ADDRESSES.map(a => (
                <button
                  key={a.value}
                  onClick={() => { setFromAddr(a.value); setFormManual(true); }}
                  style={{
                    background: fromAddr === a.value ? 'rgba(247,147,26,0.15)' : 'rgba(255,255,255,0.04)',
                    color: fromAddr === a.value ? '#FFD700' : '#bcc8e8',
                    border: fromAddr === a.value ? '1px solid rgba(247,147,26,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: fromAddr === a.value ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '4px 8px' }}>
              <Text style={{ fontSize: 11, color: '#aabbd8', whiteSpace: 'nowrap' }}>发送方:</Text>
              <Input
                placeholder="选择上方预设地址或手动输入"
                value={fromAddr}
                onChange={e => { setFromAddr(e.target.value); setFormManual(true); }}
                size="small"
                style={{ flex: 1, fontSize: 10, fontFamily: 'monospace' }}
              />
              {w.isConnected && fromAddr !== w.account && (
                <Button
                  size="small"
                  type="link"
                  onClick={() => { setFromAddr(w.account || ''); setFormManual(false); }}
                  style={{ fontSize: 10, padding: 0, color: '#F7931A', whiteSpace: 'nowrap' }}
                >
                  用钱包地址
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
              {CHAIN_ADDRESSES.map(a => (
                <button
                  key={'to-'+a.value}
                  onClick={() => setToAddr(a.value)}
                  style={{
                    background: toAddr === a.value ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.03)',
                    color: toAddr === a.value ? '#00d4aa' : '#8899bb',
                    border: toAddr === a.value ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: toAddr === a.value ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {a.value.slice(0,12)}...
                </button>
              ))}
            </div>
            <Input
              placeholder="接收方地址 (to) — 转账时必须填写"
              value={toAddr}
              onChange={e => setToAddr(e.target.value)}
              size="small"
              style={{ fontFamily: 'monospace', fontSize: 10 }}
            />
            <Input
              placeholder="金额 (uyuan) — 1 YUAN = 1000000 uyuan"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              size="small"
              type="number"
            />
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                💡 1 YUAN = 1,000,000 uyuan | 100 YUAN = 100,000,000 uyuan（最低质押）
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={() => sendBlockAction('mine')}
                loading={loading}
                style={{ background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)', color: '#fff', border: 'none' }}
                size="small"
              >
                ⛏ 挖矿 (+1 YUAN)
              </Button>
              <Button
                icon={<SendOutlined />}
                onClick={() => sendBlockAction('transfer')}
                loading={loading}
                size="small"
              >
                转账
              </Button>
              <Button
                icon={<LockOutlined />}
                onClick={() => sendBlockAction('stake')}
                loading={loading}
                style={{ background: '#22c55e', color: '#fff', border: 'none' }}
                size="small"
              >
                质押
              </Button>
              <Button
                icon={<UnlockOutlined />}
                onClick={() => sendBlockAction('unstake')}
                loading={loading}
                size="small"
                danger
              >
                解质押
              </Button>
            </Space>
            {txHash && (
              <div style={{ fontSize: 11 }}>
                {txResult?.success
                  ? <Text style={{ color: '#22c55e' }}>✅ {txResult.msg} | TX: {txHash.slice(0, 24)}...</Text>
                  : <Text style={{ color: '#ef4444' }}>❌ {txResult?.msg}</Text>
                }
              </div>
            )}
          </Space>
        </div>
      ),
    },
    {
      key: 'validators',
      label: `🔒 验证者 (${validators.length})`,
      children: (
        <div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
            最低质押 100 YUAN | 前21名可出块挖矿
          </Text>
          <Table
            dataSource={validators}
            columns={validatorColumns}
            rowKey="address"
            size="small"
            pagination={false}
            locale={{ emptyText: <Text type="secondary">暂无验证者 — 质押 100+ YUAN 成为第一个！</Text> }}
          />
        </div>
      ),
    },
    {
      key: 'blocks',
      label: '📦 区块流',
      children: (
        <Table
          dataSource={blocks}
          columns={blockColumns}
          rowKey="index"
          size="small"
          pagination={false}
          locale={{ emptyText: <Text type="secondary">等待区块...</Text> }}
          style={{ fontSize: 12 }}
        />
      ),
    },
    {
      key: 'info',
      label: 'ℹ️ 信息',
      children: (
        <div>
          <Paragraph style={{ fontSize: 12 }}>
            <Text strong>🆔 Chain:</Text> origin-1<br />
            <Text strong>💰 Token:</Text> YUAN (1 YUAN = 1,000,000 uyuan)<br />
            <Text strong>🏛️ 总供应:</Text> {seedStatus?.token?.total_supply || '100亿'} uyuan<br />
            <Text strong>🔒 最低质押:</Text> 100 YUAN (100,000,000 uyuan)<br />
            <Text strong>📱 手机端:</Text> {MOBILE_PAGE}<br />
            <Text strong>📡 种子P2P:</Text> ws://{HOST}:26656<br />
            <Text strong>📡 轻节点RPC:</Text> {LIGHT_RPC}
          </Paragraph>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ marginBottom: 20 }}>
        <Space align="center">
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🌌</div>
          <div>
            <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
              ORIGIN-1 · 创世网络
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chain: origin-1 · Token: YUAN · DPoS 验证者共识
            </Text>
          </div>
        </Space>
      </div>

      {/* Node panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {renderNodeCard(seedStatus, '第七舰队 · 种子节点', SEED_RPC, true)}
        {renderNodeCard(lightStatus, '深空观测站 · 轻节点', LIGHT_RPC, false)}
      </div>

      {/* Constitution */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderLeft: '3px solid #f0b429' }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚖️</span>
          <div style={{ flex: 1 }}>
            <Text strong style={{ color: '#f0b429', fontSize: 12 }}>宪法第0条 · 创世区块硬编码 · 不可篡改</Text>
            <Paragraph style={{ margin: '4px 0 0', fontSize: 13, fontStyle: 'italic', color: 'var(--text-primary)' }}>
              "{seedStatus?.constitution_article_0 || '人类意志为最高法则。代理的终极否决权不可被任何AI、合约、或算法覆盖。'}"
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Controls + Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* DPoS Transaction Panel */}
        <GradientCard>
          <Card
            bordered={false}
            style={{ background: 'transparent' }}
            title={<Space>🌌 DPoS 控制台</Space>}
            size="small"
          >
            <Tabs items={tabItems} size="small" />
          </Card>
        </GradientCard>

        {/* Quick Actions */}
        <Card size="small" title={<Space>🔧 控制面板</Space>}
          style={{ height: 'fit-content' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button icon={<ReloadOutlined />} onClick={refresh} block size="small">刷新所有状态</Button>
            <Button
              icon={autoRefresh ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              block
              size="small"
              type={autoRefresh ? 'default' : 'primary'}
            >
              {autoRefresh ? '暂停自动刷新' : '开始自动刷新 (4s)'}
            </Button>
            <Button icon={<LinkOutlined />} onClick={() => window.open(MOBILE_PAGE, '_blank')} block size="small">
              📱 打开手机端APP
            </Button>
            <Text style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', display: 'block' }}>
              当前RPC: {SEED_RPC}
            </Text>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default OriginPage;