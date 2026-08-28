import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, message } from 'antd';
import {
  RightOutlined, DollarOutlined, GiftOutlined,
  FireOutlined, SafetyCertificateOutlined, SwapOutlined, TeamOutlined,
  WalletOutlined, NodeIndexOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useContractData } from '../hooks/useContractData';
import { HLTH_TO_USD } from '../utils/prices';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import GradientCard from '../components/GradientCard';

// ORIGIN-1 RPC：自动检测主机地址（适配IP变化）
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isTunnel = typeof window !== 'undefined' && window.location.hostname.includes('loca.lt');
const NET_HOST = isLocalhost ? 'localhost' : (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const NET_RPC = `http://${NET_HOST}:3001`;

interface ParticleItem {
  id: number;
  x: number; y: number;
  angle: number; distance: number;
  size: number; color: string;
  speed: number;
  char: string;
}
let particleId = 0;

const FORTUNE_RUNES = ['財','富','吉','祥','福','禄','寿','發','旺','鑫','源','宝','运','瑞','豐','盛','✦','◇','◆','⬡','⬢','⬟'];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const w = useWallet();
  const cd = useContractData(w.provider, w.account, w.chainId);
  const [mining, setMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [miningComplete, setMiningComplete] = useState(false);
  const [particles, setParticles] = useState<ParticleItem[]>([]);
  
  // ── ORIGIN-1 链状态 ──
  const [originOnline, setOriginOnline] = useState(false);
  const [originHeight, setOriginHeight] = useState(0);
  const [originPeers, setOriginPeers] = useState(0);
  const [txPending, setTxPending] = useState(false);
  const [latestTx, setLatestTx] = useState('');


  // ── ORIGIN-1 链状态轮询 ──
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${NET_RPC}/status`);
        const data = await res.json();
        setOriginOnline(true);
        setOriginHeight(data.height);
        setOriginPeers(data.peers);
      } catch {
        setOriginOnline(false);
      }
    };
    poll();
    const t = setInterval(poll, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!mining) return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setMining(false);
          setMiningComplete(true);
                                return 100;
        }
        return p + (Math.random() * 3 + 0.8);
      });
    }, 100);
    return () => clearInterval(t);
  }, [mining]);

  const handleMine = useCallback(async () => {
    setMining(true);
    setProgress(0);
    setMiningComplete(false);
    setTxPending(true);

    // 粒子爆炸
    const colors = [
      '#00d4aa','#0ea5e9','#00BFFF','#1E90FF','#F0B429',
      '#00FFD1','#7B61FF','#22c55e','#00E5FF','#FFEA00',
    ];
    const newParticles: ParticleItem[] = Array.from({ length: 42 }, (_, i) => ({
      id: ++particleId,
      x: 0, y: 0,
      angle: (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.4,
      distance: 58 + Math.random() * 105,
      size: 11 + Math.random() * 26,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0.5 + Math.random() * 1.3,
      char: FORTUNE_RUNES[Math.floor(Math.random() * FORTUNE_RUNES.length)],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1400);

    // 发送交易到 ORIGIN-1 链
    try {
      const res = await fetch(`${NET_RPC}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mine',
          message: `π·量子总督 · YUAN+1 · 源链节点激活`,
          from: 'HKBTC-pi-QGo',
          ts: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLatestTx(data.block.hash.slice(0, 16));
        setOriginHeight(data.block.index);
        message.success(`🌌 ORIGIN-1 节点已激活 · Block #${data.block.index} · YUAN已产出`);
      } else {
        message.warning(`ORIGIN-1: ${data.error || '记录失败'}`);
      }
    } catch (err: any) {
      if (originOnline) {
        // DPoS拒绝或其他错误
        message.warning(`ORIGIN-1: 需先在Origin页面质押100+ YUAN成为验证者`);
      } else {
        message.info('🌌 ORIGIN-1 节点离线 · 本地记账模式 · YUAN将在节点上线后同步');
      }
    }

    setTxPending(false);
    setProgress(100);
    setMining(false);
    setMiningComplete(true);
  }, [originOnline]);

  const btnSize = 170;

  return (
    <PageShell>
      <div className="hero fade-up-1">
        <div style={{ position: 'relative', width: btnSize + 80, height: btnSize + 100, margin: '0 auto 30px' }}>

          {/* 悬浮阴影 */}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%',
            width: 140, height: 26,
            transform: 'translateX(-50%)',
            background: false
              ? 'radial-gradient(ellipse at center, rgba(100,130,160,0.18) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(0,191,255,0.45) 0%, rgba(0,200,255,0.28) 35%, rgba(0,220,255,0.15) 55%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(8px)',
            transition: 'all 0.4s',
          }} />

          {/* 符文环轨道 */}
          <div style={{
            position: 'absolute',
            top: (btnSize + 100) / 2 - (btnSize / 2 + 34),
            left: (btnSize + 80) / 2 - (btnSize / 2 + 34),
            width: btnSize + 68,
            height: btnSize + 68,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
          }}>
            <svg
              style={{
                position: 'absolute', inset: 0,
                animation: mining ? 'runeRotate 2.5s linear infinite' : 'runeRotate 10s linear infinite',
                opacity: mining ? 1 : 0.75,
                transition: 'opacity 0.6s',
              }}
              viewBox="0 0 240 240"
            >
              <defs>
                <linearGradient id="runeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00BFFF" />
                  <stop offset="25%" stopColor="#1E90FF" />
                  <stop offset="50%" stopColor="#00CED1" />
                  <stop offset="75%" stopColor="#4B9FFF" />
                  <stop offset="100%" stopColor="#00BFFF" />
                </linearGradient>
                <filter id="runeGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 三相轨道 */}
              <circle cx="120" cy="120" r="112" fill="none"
                stroke="url(#runeGrad1)" strokeWidth="1.5" strokeDasharray="6 16"
                filter="url(#runeGlow)" opacity="0.85" />
              <circle cx="120" cy="120" r="116" fill="none"
                stroke="rgba(30,144,255,0.4)" strokeWidth="1" strokeDasharray="3 12"
                filter="url(#runeGlow)" opacity="0.5" transform="rotate(-30 120 120)" />
              <circle cx="120" cy="120" r="108" fill="none"
                stroke="rgba(0,180,255,0.5)" strokeWidth="0.8" strokeDasharray="2 18"
                filter="url(#runeGlow)" opacity="0.4" transform="rotate(60 120 120)" />

              {/* 6个符文锚点 */}
              {[0, 60, 120, 180, 240, 300].map(angle => (
                <g key={angle} transform={`rotate(${angle} 120 120)`}>
                  <circle cx="120" cy="8" r="3" fill="#00BFFF" filter="url(#runeGlow)" opacity="0.9" />
                  <circle cx="120" cy="8" r="6" fill="none" stroke="rgba(0,191,255,0.4)" strokeWidth="0.8" />
                </g>
              ))}

              {/* 漂浮符文 */}
              {[
                { text: '財', a: 0 }, { text: '源', a: 72 }, { text: '福', a: 144 },
                { text: '旺', a: 216 }, { text: '鑫', a: 288 },
              ].map(({ text, a }) => {
                const rad = (a * Math.PI) / 180;
                const r = 112;
                return (
                  <text key={a} x={120 + r * Math.cos(rad) - 12} y={120 + r * Math.sin(rad) + 8}
                    fill={mining ? '#00BFFF' : 'rgba(30,144,255,0.55)'}
                    fontSize="16" fontWeight="bold" fontFamily="serif"
                    filter="url(#runeGlow)" opacity={mining ? 1 : 0.7}>
                    {text}
                  </text>
                );
              })}
            </svg>

            {/* 逆流光环 */}
            <div style={{
              position: 'absolute', inset: -10,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: mining ? 'rgba(0,200,255,0.7)' : 'rgba(0,191,255,0.25)',
              borderRightColor: mining ? 'rgba(0,220,255,0.55)' : 'rgba(0,191,255,0.18)',
              animation: mining ? 'runeRotateRev 1.6s linear infinite' : 'runeRotateRev 14s linear infinite',
              opacity: 0.8,
              filter: 'blur(1.5px)',
              transition: 'opacity 0.5s',
            }} />
          </div>

          {/* 符文粒子爆炸 */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              fontSize: p.size,
              fontWeight: 900,
              fontFamily: "'Times New Roman','Noto Serif SC','KaiTi',serif",
              color: p.color,
              textShadow: `0 0 ${p.size}px ${p.color}, 0 0 ${p.size * 2.5}px ${p.color}`,
              animation: `runeFly 1.4s ease-out forwards`,
              '--angle': `${p.angle}rad`,
              '--dist': `${p.distance}px`,
              zIndex: 10,
              pointerEvents: 'none',
            } as React.CSSProperties}>
              {p.char}
            </div>
          ))}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* 按钮主体 · 量子总督最高美学 */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div
            onClick={handleMine}
            className="pi-rune-btn"
            title='π · 激活量子能量 · 招财进宝'
            style={{
              position: 'absolute',
              top: 40, left: 40,
              width: btnSize, height: btnSize,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              zIndex: 1,

              background: [
                  'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.1) 0%, transparent 40%)',
                  'radial-gradient(ellipse at 60% 22%, rgba(0,229,255,0.08) 0%, transparent 55%)',
                  'radial-gradient(ellipse at 30% 80%, rgba(0,200,255,0.1) 0%, transparent 45%)',
                  'radial-gradient(circle at 50% 50%, #12203a 0%, #0d1a2e 40%, #081020 100%)',
                ].join(','),

              border: '2.5px solid rgba(0,191,255,0.75)',
              outline: '2px solid rgba(0,200,255,0.25)',

              boxShadow: [
                  '0 1px 0 rgba(255,255,255,0.05) inset',
                  '0 2px 4px rgba(0,0,0,0.6)',
                  '0 10px 24px rgba(0,0,0,0.5)',
                  '0 22px 48px rgba(0,0,0,0.35)',
                  '0 0 45px rgba(0,191,255,0.35)',
                  '0 0 90px rgba(0,191,255,0.22)',
                  '0 0 70px rgba(0,200,255,0.2)',
                  '0 0 150px rgba(0,200,255,0.1)',
                ].join(', '),

              transition: 'all 0.13s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              animation: mining
                ? 'piPulse 1s ease-in-out infinite'
                : 'runeBreathe 4.5s ease-in-out infinite',
            }}
            onMouseDown={e => {
              if (!false && !mining) {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'scale(0.91) translateY(5px)';
                el.style.boxShadow = [
                  '0 1px 0 rgba(255,255,255,0.02) inset',
                  '0 1px 3px rgba(0,0,0,0.7)',
                  '0 5px 16px rgba(0,0,0,0.5)',
                  '0 0 20px rgba(0,180,255,0.18)',
                  '0 0 48px rgba(0,200,255,0.16)',
                ].join(', ');
              }
            }}
            onMouseUp={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'scale(1) translateY(0)';
              el.style.boxShadow = false
                ? '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)'
                : [
                  '0 1px 0 rgba(255,255,255,0.05) inset',
                  '0 2px 4px rgba(0,0,0,0.6)',
                  '0 10px 24px rgba(0,0,0,0.5)',
                  '0 22px 48px rgba(0,0,0,0.35)',
                  '0 0 45px rgba(0,191,255,0.35)',
                  '0 0 90px rgba(0,191,255,0.22)',
                  '0 0 70px rgba(0,200,255,0.2)',
                  '0 0 150px rgba(0,200,255,0.1)',
                ].join(', ');
            }}
            onMouseEnter={e => {
              if (!false && !mining) {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'scale(1.05) translateY(-4px)';
                el.style.boxShadow = [
                  '0 2px 0 rgba(255,255,255,0.06) inset',
                  '0 6px 16px rgba(0,0,0,0.5)',
                  '0 16px 36px rgba(0,0,0,0.4)',
                  '0 30px 64px rgba(0,0,0,0.3)',
                  '0 0 60px rgba(0,191,255,0.5)',
                  '0 0 110px rgba(0,191,255,0.3)',
                  '0 0 100px rgba(0,200,255,0.28)',
                  '0 0 160px rgba(0,200,255,0.08)',
                ].join(', ');
                el.style.borderColor = 'rgba(0,191,255,0.9)';
                el.style.outlineColor = 'rgba(0,210,255,0.35)';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'scale(1) translateY(0)';
              el.style.borderColor = false
                ? 'rgba(100,100,110,0.2)'
                : 'rgba(0,191,255,0.65)';
              el.style.outlineColor = 'rgba(0,200,255,0.18)';
              el.style.boxShadow = false
                ? '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)'
                : [
                  '0 1px 0 rgba(255,255,255,0.05) inset',
                  '0 2px 4px rgba(0,0,0,0.6)',
                  '0 10px 24px rgba(0,0,0,0.5)',
                  '0 22px 48px rgba(0,0,0,0.35)',
                  '0 0 45px rgba(0,191,255,0.35)',
                  '0 0 90px rgba(0,191,255,0.22)',
                  '0 0 70px rgba(0,200,255,0.2)',
                  '0 0 150px rgba(0,200,255,0.1)',
                ].join(', ');
            }}
          >
            {/* 穹顶高光 */}
            <div style={{
              position: 'absolute',
              top: 22, left: '18%',
              width: 78, height: 30,
              borderRadius: '50%',
              background: false
                ? 'none'
                : 'radial-gradient(ellipse at center, rgba(30,144,255,0.15) 0%, rgba(255,255,255,0.07) 25%, transparent 70%)',
              transform: 'rotate(-15deg)',
              pointerEvents: 'none',
              transition: 'opacity 0.3s',
            }} />

            {/* 底部暖反光 */}
            <div style={{
              position: 'absolute',
              bottom: 16, left: '26%',
              width: 54, height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(0,200,255,0.22) 0%, rgba(0,230,255,0.12) 35%, transparent 80%)',
              pointerEvents: 'none',
              transition: 'opacity 0.3s',
            }} />

            {/* 右侧冷光斑 */}
            <div style={{
              position: 'absolute',
              top: '42%', right: 12,
              width: 32, height: 18,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(0,210,255,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
              transform: 'rotate(28deg)',
              transition: 'opacity 0.3s',
            }} />

            {/* π 字符 */}
            <span style={{
              position: 'relative', zIndex: 2,
              fontSize: 64,
              fontWeight: 900,
              fontFamily: "'Times New Roman','Georgia','Noto Serif',serif",
              lineHeight: 1,
              letterSpacing: '-1px',
              color: '#FFFFFF',
              textShadow: [
                  '0 3px 0 rgba(0,0,0,0.5)',
                  '0 4px 4px rgba(0,0,0,0.35)',
                  '0 -2px 0 rgba(255,255,255,0.08)',
                  '0 0 24px rgba(0,191,255,0.8)',
                  '0 0 48px rgba(0,191,255,0.5)',
                  '0 0 56px rgba(0,150,255,0.12)',
                  '0 0 28px rgba(0,229,255,0.15)',
                  '0 0 64px rgba(0,200,255,0.08)',
                ].join(', '),
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45)) drop-shadow(0 2px 14px rgba(0,191,255,0.55)) drop-shadow(0 0 32px rgba(0,200,255,0.45))',
              transition: 'all 0.35s',
            }}>
              π
            </span>

            {/* SVG 能量进度环 */}
            {mining && (
              <svg
                style={{ position: 'absolute', inset: -10, transform: 'rotate(-90deg)', zIndex: 3, pointerEvents: 'none' }}
                viewBox="0 0 190 190"
              >
                <defs>
                  <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E90FF" />
                    <stop offset="20%" stopColor="#00BFFF" />
                    <stop offset="50%" stopColor="#00CED1" />
                    <stop offset="80%" stopColor="#00BFFF" />
                    <stop offset="100%" stopColor="#1E90FF" />
                  </linearGradient>
                  <filter id="energyGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="95" cy="95" r="84" fill="none"
                  stroke="rgba(0,200,255,0.1)" strokeWidth="5.5" />
                <circle cx="95" cy="95" r="84" fill="none"
                  stroke="url(#energyGrad)" strokeWidth="5.5" strokeLinecap="round"
                  filter="url(#energyGlow)"
                  strokeDasharray={`${Math.min(progress, 100) * 5.278} 527.8`}
                  style={{ transition: 'stroke-dasharray 0.12s' }} />
              </svg>
            )}
          </div>
        </div>

        {/* ORIGIN-1 链状态条 */}
        <div style={{
          marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 11, fontFamily: 'monospace',
        }}>
          <span style={{
            display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
            background: originOnline ? '#00d4aa' : '#ef4444',
            boxShadow: `0 0 8px ${originOnline ? '#00d4aa' : '#ef4444'}`,
            animation: originOnline ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{ color: originOnline ? '#00d4aa' : '#ef4444' }}>
            ORIGIN-1 {originOnline ? '· 在线' : '· 离线'}
          </span>
          {originOnline && (
            <>
              <span style={{ color: '#667799' }}>|</span>
              <span style={{ color: '#c0cdf0' }}>高度 {originHeight}</span>
              <span style={{ color: '#667799' }}>|</span>
              <span style={{ color: '#c0cdf0' }}>节点 {originPeers}</span>
            </>
          )}
          {latestTx && (
            <>
              <span style={{ color: '#667799' }}>|</span>
              <span style={{ color: '#00d4aa', fontSize: 10 }}>TX:{latestTx}</span>
            </>
          )}
          {txPending && (
            <span style={{ color: '#f0b429', fontSize: 10 }}>上链中...</span>
          )}
        </div>

        {/* 状态文案 */}
        {mining && (
          <>
            <div className="progress-track" style={{ maxWidth: 220, margin: '0 auto 6px' }}>
              <div className="progress-fill" style={{
                width: '100%',
                background: 'linear-gradient(90deg, #00d4aa, #0ea5e9, #0078FF)',
                boxShadow: '0 0 10px rgba(0,212,170,0.55)',
              }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8,
              background: 'linear-gradient(90deg, #00d4aa, #0ea5e9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              🌌 ORIGIN-1 节点激活中 · YUAN产出 · 创世见证
            </div>
          </>
        )}
        {miningComplete && !mining && (
          <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 700 }}>
            <span style={{
              background: 'linear-gradient(90deg, #00d4aa, #22c55e, #0ea5e9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              🌌 ORIGIN-1 已激活 · YUAN已上链 · 宪法第0条守护
            </span>
          </div>
        )}

        <h2 style={{ marginBottom: 6, color: '#ffffff', fontSize: 22, fontWeight: 800 }}>
          <span style={{ background: 'linear-gradient(135deg, #F7931A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HKBTX</span>{' '}
          香港BTC国际交易所
        </h2>
        <span style={{ color: '#c0cdf0', fontSize: 14 }}>
          <span style={{ color: '#00d4aa', fontWeight: 700 }}>🌌 ORIGIN-1</span> · 创世网络 · π激活节点 · YUAN产出
        </span>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {w.isConnected ? (
            <>
              <button className="btn-primary-glow" onClick={() => navigate('/staking')}>
                💰 参与分红 <RightOutlined />
              </button>
              <button className="btn-accent" onClick={() => navigate('/redeem')}>
                🛡️ 兑换产品
              </button>
            </>
          ) : (
            <button className="btn-primary-glow" onClick={w.connectWallet}>
              <WalletOutlined /> 连接钱包开始
            </button>
          )}
        </div>
      </div>

      {/* ═══ Token Balances ═══ */}
      <GradientCard className="fade-up-2">
        <div className="flex-between mb-2">
          <span style={{ fontSize: 15, color: '#ffffff', fontWeight: 700 }}>我的资产</span>
          <button className="btn-outline" onClick={() => navigate('/wallet')}>查看全部 →</button>
        </div>
        <Row gutter={[10, 10]}>
          <Col span={8}>
            <StatCard label="BNB 余额" value={cd.loading ? 0 : Number(w.bnbBalance)} decimals={4} accent="bnb" icon={<DollarOutlined />} />
          </Col>
          <Col span={8}>
            <StatCard label="DRG 积分" value={cd.loading ? 0 : Number(w.drgBalance)} decimals={0} accent="drg" icon={<GiftOutlined />} />
          </Col>
          <Col span={8}>
            <StatCard label="HLTH 治理 · 锚定1USDT" value={cd.loading ? 0 : Number(w.hlthBalance)} decimals={2} suffix={` ≈ $${(Number(w.hlthBalance) * HLTH_TO_USD).toFixed(2)}`} accent="hlth" icon={<FireOutlined />} />
          </Col>
        </Row>
      </GradientCard>

      <div className="fade-up-3" style={{ marginTop: 20 }}>
        <div className="section-header">
          <div>
            <div className="section-title">协议数据</div>
            <div className="section-subtitle">实时链上统计</div>
          </div>
          <span className="tag tag-cyan">LIVE</span>
        </div>
        <Row gutter={[10, 10]}>
          <Col span={8}>
            <StatCard label="DRG 总量" value={cd.loading ? 0 : Number(cd.drgTotalSupply)} decimals={0} accent="drg" sparkline="drg" change={{ value: 2.4, positive: true }} />
          </Col>
          <Col span={8}>
            <StatCard label="质押 TVL" value={cd.loading ? 0 : Number(cd.totalStaked)} decimals={0} suffix={` ≈ $${(Number(cd.totalStaked) * HLTH_TO_USD).toLocaleString()}`} accent="hlth" sparkline="hlth" />
          </Col>
          <Col span={8}>
            <StatCard label="质押 APR" value={cd.loading ? 0 : Number(cd.stakingApr)} decimals={1} suffix="%" accent="cyan" change={{ value: 0.5, positive: true }} />
          </Col>
        </Row>
      </div>

      <div className="fade-up-4" style={{ marginTop: 20 }}>
        <div className="section-title mb-4">核心功能</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#ffb347' }} />, title: '安全透明', desc: '链上执行可查', path: '/staking' },
            { icon: <SwapOutlined style={{ fontSize: 24, color: '#F7931A' }} />, title: 'DeFi驱动', desc: 'DRG兑换产品', path: '/redeem' },
            { icon: <TeamOutlined style={{ fontSize: 24, color: '#00BFFF' }} />, title: 'DAO治理', desc: 'HLTH投票', path: '/dao' },
          ].map((f, i) => (
            <GradientCard key={i} onClick={() => navigate(f.path)}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>{f.icon}</div>
                <span style={{ display: 'block', fontSize: 14, color: '#ffffff', fontWeight: 700 }}>{f.title}</span>
                <span style={{ fontSize: 12, color: '#8899bb', fontWeight: 500 }}>{f.desc}</span>
              </div>
            </GradientCard>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Home;
