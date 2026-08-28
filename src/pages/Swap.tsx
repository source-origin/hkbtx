import React, { useState, useCallback, useEffect } from 'react';
import { message, InputNumber, Typography, Select, Tag, Row, Col } from 'antd';
import { SwapOutlined, ArrowDownOutlined, GiftOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESSES } from '../contracts/address';
import { DRG_ABI, DRG_REDEEM_ABI } from '../utils/abi';
import { HLTH_TO_USD } from '../utils/prices';
import PageShell from '../components/PageShell';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

// ── Token Logo — 本地PNG + 内嵌SVG双保险，永不依赖外网 ──
const TokenBadge: React.FC<{ ticker: string; size?: number }> = ({ ticker, size = 24 }) => {
  const pngTokens = ['usdt','eth','dai','bnb','btcb','busd','hlth'];
  if (pngTokens.includes(ticker.toLowerCase())) {
    return (
      <img
        src={`/tokens/${ticker.toLowerCase()}.png`}
        alt={ticker}
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'contain', background: '#1a1f3a' }}
      />
    );
  }

  const svgs: Record<string, string> = {
    CAKE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#D1884F"/><text x="50" y="72" text-anchor="middle" font-size="50" font-weight="900" fill="white" font-family="sans-serif">🎂</text></svg>`,
    DRG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22C55E"/><stop offset="100%" stop-color="#064A20"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#dg)"/><text x="50" y="72" text-anchor="middle" font-size="38" font-weight="900" fill="white" font-family="sans-serif">DRG</text></svg>`,
    HLTH: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#5B21B6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#hg)"/><text x="50" y="62" text-anchor="middle" font-size="28" font-weight="900" fill="white" font-family="sans-serif">HLTH</text></svg>`,
  };

  const svg = svgs[ticker];
  if (svg) {
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    return (
      <img
        src={dataUri}
        alt={ticker}
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'contain' }}
      />
    );
  }

  // Unknown ticker fallback
  const colorMap: Record<string, string> = {  };
  const bg = colorMap[ticker] || '#555';
  const label = ticker.length > 4 ? ticker.slice(0, 2) : ticker.slice(0, 1);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ color: '#fff', fontSize: size * 0.45, fontWeight: 700, lineHeight: 1 }}>
        {label}
      </span>
    </div>
  );
};

// ── BSC 代币列表 ──
const TOKENS: Record<string, {
  symbol: string; address: string; decimals: number;
  color: string;
}> = {
  USDT: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, color: '#26a17b' },
  BUSD: { symbol: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, color: '#f0b90b' },
  CAKE: { symbol: 'CAKE', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18, color: '#d1884f' },
  BNB:  { symbol: 'BNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18, color: '#f0b429' },
  ETH:  { symbol: 'ETH', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', decimals: 18, color: '#627eea' },
  BTCB: { symbol: 'BTCB', address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', decimals: 18, color: '#f7931a' },
  DAI:  { symbol: 'DAI', address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18, color: '#f5ac37' },
};

// ── 产品列表 ──
const PRODUCTS = [
  { id: 'bronze', name: '青铜护盾', desc: 'DRG 护肝精华 × 1个月', drg: 1380, icon: '🛡️', color: '#cd7f32' },
  { id: 'silver', name: '白银护盾', desc: 'DRG 护肝精华 × 3个月装', drg: 4140, icon: '🛡️', color: '#c0c0c0' },
  { id: 'gold', name: '黄金护盾', desc: 'DRG 护肝精华 × 6个月装 + 限量 NFT', drg: 8280, icon: '🛡️', color: '#ffd700' },
];

// PancakeSwap Router
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const PANCAKE_ABI = [
  'function getAmountsOut(uint256,address[]) view returns (uint256[])',
  'function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) returns (uint256[])',
];
const ERC20_ABI = [
  'function approve(address,uint256) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const SwapPage: React.FC = () => {
  const w = useWallet();

  // ── Sub-tab ──
  const [activeTab, setActiveTab] = useState<'token' | 'product'>('token');

  // ── Token Swap State ──
  const [fromToken, setFromToken] = useState('USDT');
  const [toToken, setToToken] = useState('DRG');
  const [amountIn, setAmountIn] = useState<string>('');
  const [amountOut, setAmountOut] = useState<string>('');
  const [quote, setQuote] = useState<{ route: string } | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapNeedsApprove, setSwapNeedsApprove] = useState(false);
  const [slippage, setSlippage] = useState(1.0);

  // ── Product Redeem State ──
  const [drgAmount, setDrgAmount] = useState<number | null>(null);
  const [selProduct, setSelProduct] = useState<string | null>(null);
  const [rLoading, setRLoading] = useState(false);
  const [rNeedsApprove, setRNeedsApprove] = useState(true);

  // ── Swap: 报价（debounce 300ms 防RPC限流）──
  const fetchQuote = useCallback(async () => {
    if (!amountIn || !fromToken || !toToken || fromToken === toToken || !w.provider) {
      setAmountOut('');
      setQuote(null);
      return;
    }
    try {
      const amt = parseFloat(amountIn); if (isNaN(amt) || amt <= 0) return;
      const fromAddr = TOKENS[fromToken]?.address;
      const toAddr = TOKENS[toToken]?.address;
      if (!fromAddr || !toAddr) return;
      const pcs = new ethers.Contract(PANCAKE_ROUTER, PANCAKE_ABI, w.provider);
      const fc = new ethers.Contract(fromAddr, ERC20_ABI, w.provider);
      const dec = await fc.decimals().catch(() => 18);
      const amounts = await pcs.getAmountsOut(ethers.utils.parseUnits(amountIn, dec), [fromAddr, toAddr]);
      if (!amounts || amounts.length < 2 || amounts[1].isZero()) { setAmountOut('0'); setQuote(null); return; }
      setAmountOut(ethers.utils.formatUnits(amounts[1], TOKENS[toToken]?.decimals || 18));
      setQuote({ route: 'PancakeSwap V2' });
    } catch { /* silent */ }
  }, [amountIn, fromToken, toToken, w.provider]);

  // Debounce quote calls
  useEffect(() => {
    const t = setTimeout(() => fetchQuote(), 300);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  // ── Swap: 授权 ──
  const swapApprove = useCallback(async () => {
    if (!w.signer || !amountIn) return;
    setSwapLoading(true);
    try {
      const fc = new ethers.Contract(TOKENS[fromToken].address, ERC20_ABI, w.signer);
      const dec = await fc.decimals().catch(() => 18);
      const tx = await fc.approve(PANCAKE_ROUTER, ethers.utils.parseUnits(amountIn, dec));
      await tx.wait();
      setSwapNeedsApprove(false);
      message.success('授权成功');
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setSwapLoading(false); }
  }, [w.signer, amountIn, fromToken]);

  // ── Swap: 执行 ──
  const executeSwap = useCallback(async () => {
    if (!w.signer || !amountIn || !amountOut) return;
    setSwapLoading(true);
    try {
      const fromAddr = TOKENS[fromToken].address, toAddr = TOKENS[toToken].address;
      const pcs = new ethers.Contract(PANCAKE_ROUTER, PANCAKE_ABI, w.signer);
      const fc = new ethers.Contract(fromAddr, ERC20_ABI, w.signer);
      const dec = await fc.decimals().catch(() => 18);
      const minOut = parseFloat(amountOut) * (1 - slippage / 100);
      const tc = new ethers.Contract(toAddr, ERC20_ABI, w.signer);
      const tDec = await tc.decimals().catch(() => 18);
      const deadline = Math.floor(Date.now() / 1000) + 300;
      const gasEstimate = await pcs.estimateGas.swapExactTokensForTokens(
        ethers.utils.parseUnits(amountIn, dec),
        ethers.utils.parseUnits(minOut.toFixed(tDec), tDec),
        [fromAddr, toAddr], w.account!, deadline
      ).catch(() => null);
      await pcs.swapExactTokensForTokens(
        ethers.utils.parseUnits(amountIn, dec),
        ethers.utils.parseUnits(minOut.toFixed(tDec), tDec),
        [fromAddr, toAddr], w.account!, deadline,
        gasEstimate ? { gasLimit: gasEstimate.mul(12).div(10) } : {}
      );
      message.success(`Swap 成功! ${amountIn} ${fromToken} → ${amountOut} ${toToken}`);
      setAmountIn(''); setAmountOut(''); setQuote(null);
      w.refresh();
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setSwapLoading(false); }
  }, [w, amountIn, amountOut, fromToken, toToken, slippage]);

  // ── Swap: 翻转 ──
  const flipTokens = useCallback(() => {
    setFromToken(toToken); setToToken(fromToken);
    setAmountIn(''); setAmountOut(''); setQuote(null);
  }, [fromToken, toToken]);

  // ── Product: 授权 ──
  const productApprove = useCallback(async () => {
    if (!w.signer || !drgAmount) return;
    setRLoading(true);
    try {
      const drg = new ethers.Contract(CONTRACT_ADDRESSES.DRG, DRG_ABI, w.signer);
      const tx = await drg.approve(CONTRACT_ADDRESSES.DRGRedeem, ethers.utils.parseEther(drgAmount.toString()));
      await tx.wait();
      setRNeedsApprove(false);
      message.success('DRG 授权成功');
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setRLoading(false); }
  }, [w.signer, drgAmount]);

  // ── Product: 兑换 ──
  const productRedeem = useCallback(async () => {
    if (!w.signer || !drgAmount) return;
    setRLoading(true);
    try {
      const rc = new ethers.Contract(CONTRACT_ADDRESSES.DRGRedeem, DRG_REDEEM_ABI, w.signer);
      const productId = selProduct ? PRODUCTS.findIndex(p => p.id === selProduct) + 1 : 1;
      const tx = await rc.redeem(productId, 1);
      await tx.wait();
      message.success('兑换成功！NFT 已发放至你的钱包');
      setDrgAmount(null); setSelProduct(null); setRNeedsApprove(true);
      w.refresh();
    } catch (e: any) { message.error(e.message?.slice(0, 200)); }
    finally { setRLoading(false); }
  }, [w.signer, drgAmount, w]);

  // ── Token select option renderer ──
  const tokenSelectOption = (ticker: string) => ({
    label: ticker,
    value: ticker,
    optionLabel: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
        <TokenBadge ticker={ticker} size={28} />
        <span style={{ fontWeight: 600, fontSize: 15, color: '#ffffff' }}>{ticker}</span>
      </span>
    ),
  });

  const tokenOpts = Object.keys(TOKENS).map(k => tokenSelectOption(k));
  // Add DRG & HLTH (project tokens)
  tokenOpts.push(tokenSelectOption('DRG'), tokenSelectOption('HLTH'));

  // ── 未连接 ──
  if (!w.isConnected) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <SwapOutlined style={{ fontSize: 48, color: 'var(--text-dim)' }} />
          <Title level={4} style={{ marginTop: 16, color: 'var(--text-primary)' }}>请先连接钱包</Title>
          <Text style={{ color: 'var(--text-secondary)' }}>连接钱包后使用兑换功能</Text>
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
          <span style={{ background: 'linear-gradient(135deg, #F7931A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            兑换
          </span>
        </Title>
        <Text style={{ color: '#ccd6f6', fontSize: 14 }}>
          代币 Swap · PancakeSwap V2 · DRG 产品兑换
        </Text>
      </div>

      {/* Sub-Tabs */}
      <div style={{
        display: 'flex', gap: 4, maxWidth: 480, margin: '0 auto 16px',
        background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 5,
      }} className="fade-up-2">
        <button
          onClick={() => setActiveTab('token')}
          className={activeTab === 'token' ? 'btn-tab-active' : 'btn-tab'}
        >💱 代币兑换</button>
        <button
          onClick={() => setActiveTab('product')}
          className={activeTab === 'product' ? 'btn-tab-active' : 'btn-tab'}
        >🛡️ 产品兑换</button>
      </div>

      {/* ── 代币兑换面板 ── */}
      {activeTab === 'token' && (
      <div className="fade-up-3">
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'linear-gradient(160deg, rgba(10,15,42,0.95), rgba(15,22,55,0.9))', border: '1px solid rgba(247,147,26,0.15)', borderRadius: 20, padding: 24, boxShadow: '0 4px 32px rgba(0,0,0,0.5), 0 0 60px rgba(247,147,26,0.04)' }}>
          {/* FROM */}
          <div style={{ marginBottom: 12 }}>
            <div className="flex-between mb-2">
              <Text style={{ color: '#e8edf6', fontSize: 13, fontWeight: 600 }}>卖出</Text>
              <Text style={{ color: '#aabbd8', fontSize: 12 }}>余额: {w.bnbBalance}</Text>
            </div>
            <div style={{ 
              background: 'rgba(0,0,0,0.35)', padding: '14px 16px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <Select
                value={fromToken}
                onChange={v => { setFromToken(v); setAmountIn(''); setSwapNeedsApprove(true); }}
                bordered={false}
                dropdownStyle={{ minWidth: 220, background: '#0d1433', border: '1px solid rgba(247,147,26,0.25)', borderRadius: 12 }}
                dropdownMatchSelectWidth={false}
                style={{ minWidth: 120 }}
                options={tokenOpts}
                optionLabelProp="label"
                optionRender={(opt) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <TokenBadge ticker={opt.value as string} size={28} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{opt.value as string}</span>
                  </div>
                )}
              />
              <InputNumber
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 22, fontWeight: 700, color: '#ffffff' }}
                placeholder="0.00"
                value={amountIn || undefined}
                onChange={v => { setAmountIn(v?.toString() || ''); setSwapNeedsApprove(true); }}
                stringMode controls={false}
              />
            </div>
          </div>

          {/* FLIP */}
          <div style={{ textAlign: 'center', margin: '-6px 0' }}>
            <button onClick={flipTokens} style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(247,147,26,0.15)',
              border: '2px solid rgba(247,147,26,0.3)', cursor: 'pointer', fontSize: 18,
              color: '#FFD700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2, position: 'relative', transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: '0 0 12px rgba(247,147,26,0.15)'
            }} onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(180deg)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(247,147,26,0.35)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(247,147,26,0.15)'; }}>
              <ArrowDownOutlined />
            </button>
          </div>

          {/* TO */}
          <div>
            <div className="flex-between mb-2">
              <Text style={{ color: '#e8edf6', fontSize: 13, fontWeight: 600 }}>买入</Text>
                <Text style={{ color: '#aabbd8', fontSize: 12 }}>
                余额: {toToken === 'DRG' ? w.drgBalance : toToken === 'HLTH' ? `${w.hlthBalance} ≈ $${(Number(w.hlthBalance) * HLTH_TO_USD).toFixed(2)}` : '--'}
              </Text>
            </div>
            <div style={{ 
              background: 'rgba(0,0,0,0.35)', padding: '14px 16px', borderRadius: 14,
              border: '1px solid rgba(247,147,26,0.1)', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <Select
                value={toToken}
                onChange={v => { setToToken(v); setAmountOut(''); }}
                bordered={false}
                dropdownStyle={{ minWidth: 220, background: '#0d1433', border: '1px solid rgba(247,147,26,0.25)', borderRadius: 12 }}
                dropdownMatchSelectWidth={false}
                style={{ minWidth: 120 }}
                options={tokenOpts}
                optionLabelProp="label"
                optionRender={(opt) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <TokenBadge ticker={opt.value as string} size={28} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{opt.value as string}</span>
                  </div>
                )}
              />
              <InputNumber
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 22, fontWeight: 700, color: '#00ffd1' }}
                placeholder="0.00"
                value={amountOut ? parseFloat(amountOut) : undefined}
                readOnly controls={false}
              />
            </div>
          </div>

          {quote && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(247,147,26,0.08)', borderRadius: 12, border: '1px solid rgba(247,147,26,0.1)', display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#bcc8e8' }}>路由: <span style={{ color: '#F7931A', fontWeight: 600 }}>{quote.route}</span></Text>
              <Text style={{ fontSize: 12, color: '#bcc8e8' }}>滑点: <span style={{ color: '#ffd700', fontWeight: 600 }}>{slippage}%</span></Text>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            {!amountIn ? (
              <button className="btn-primary-glow" disabled style={{ width: '100%', opacity: 0.4 }}>输入数量</button>
            ) : swapNeedsApprove ? (
              <button className="btn-accent" onClick={swapApprove} disabled={swapLoading} style={{ width: '100%', fontSize: 16, padding: '14px 0' }}>{swapLoading ? '⏳ 授权中...' : '✅ 授权代币'}</button>
            ) : (
              <button className="btn-primary-glow" onClick={executeSwap} disabled={swapLoading} style={{ width: '100%', fontSize: 16, padding: '14px 0' }}>
                {swapLoading ? '⏳ 交易中...' : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <TokenBadge ticker={fromToken} size={22} />
                    Swap {fromToken} → {toToken}
                    <TokenBadge ticker={toToken} size={22} />
                  </span>
                )}
              </button>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, color: '#aabbd8', fontWeight: 500 }}>滑点:</Text>
            {[0.5, 1, 2, 5].map(v => (
              <button key={v}
                onClick={() => setSlippage(v)}
                style={{
                  background: slippage === v ? 'rgba(247,147,26,0.2)' : 'rgba(255,255,255,0.05)',
                  color: slippage === v ? '#FFD700' : '#bcc8e8',
                  fontWeight: slippage === v ? 700 : 500,
                  fontSize: 13,
                  border: slippage === v ? '1px solid rgba(247,147,26,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '6px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >{v}%</button>
            ))}
          </div>
        </div>

        {/* Supported Tokens */}
        <div style={{ maxWidth: 480, margin: '16px auto', background: 'linear-gradient(160deg, rgba(10,15,42,0.8), rgba(15,22,55,0.7))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
          <div className="flex-between mb-2">
            <Text strong style={{ color: '#ffffff', fontSize: 14 }}>支持币种</Text>
            <Tag color="cyan">BSC</Tag>
          </div>
          <div className="hairline" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {['USDT','BUSD','BNB','ETH','BTCB','DAI','CAKE','DRG','HLTH'].map(ticker => (
              <div key={ticker} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '6px 14px',
              }}>
                <TokenBadge ticker={ticker} size={22} />
                <Text style={{ fontSize: 13, color: '#e8edf6', fontWeight: 600 }}>{ticker}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── 产品兑换面板 ── */}
      {activeTab === 'product' && (
      <div className="fade-up-3">
        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16, maxWidth: 520, margin: '0 auto 16px' }}>
          {PRODUCTS.map(p => (
            <div
              key={p.id}
              onClick={() => { setDrgAmount(p.drg); setSelProduct(p.id); setRNeedsApprove(true); }}
              style={{
                textAlign: 'center', padding: '18px 12px', cursor: 'pointer',
                background: selProduct === p.id 
                  ? 'linear-gradient(145deg, rgba(247,147,26,0.12), rgba(255,215,0,0.08))'
                  : 'linear-gradient(145deg, rgba(10,15,42,0.9), rgba(15,22,55,0.8))',
                border: selProduct === p.id 
                  ? '2px solid rgba(247,147,26,0.5)' 
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                boxShadow: selProduct === p.id
                  ? '0 0 24px rgba(247,147,26,0.15)'
                  : '0 2px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.25s',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
              <Text strong style={{ display: 'block', fontSize: 14, color: '#ffffff', marginBottom: 4 }}>{p.name}</Text>
              <Text style={{ fontSize: 11, color: '#bcc8e8', display: 'block', margin: '6px 0' }}>{p.desc}</Text>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: 8,
                background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                fontSize: 13, fontWeight: 700,
              }}>{p.drg.toLocaleString()} DRG</span>
            </div>
          ))}
        </div>

        {/* Redeem Form */}
        <div style={{ maxWidth: 520, margin: '0 auto', background: 'linear-gradient(160deg, rgba(10,15,42,0.95), rgba(15,22,55,0.9))', border: '1px solid rgba(247,147,26,0.15)', borderRadius: 20, padding: 24, boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
          <div className="flex-between mb-4">
            <Text strong style={{ color: '#ffffff', fontSize: 15 }}>兑换操作</Text>
            <span style={{ padding: '3px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 12, fontWeight: 700 }}>DRG</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.35)', padding: 16, borderRadius: 14, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-between">
              <Text style={{ color: '#e8edf6', fontSize: 13, fontWeight: 600 }}>消耗 DRG</Text>
              <Text style={{ color: '#aabbd8', fontSize: 12 }}>
                余额: {Number(w.drgBalance).toLocaleString()} DRG
              </Text>
            </div>
            <InputNumber style={{ width: '100%', marginTop: 10 }} size="large" min={0} value={drgAmount}
              onChange={v => { setDrgAmount(v); setSelProduct(null); setRNeedsApprove(true); }} placeholder="0" stringMode />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {['1380', '4140', '8280'].map(v => (
                <button key={v} onClick={() => { setDrgAmount(Number(v)); setRNeedsApprove(true); }}
                  style={{
                    background: 'rgba(255,255,255,0.06)', color: '#bcc8e8',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                    padding: '6px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{Number(v).toLocaleString()}</button>
              ))}
            </div>
          </div>

          <div className="data-row">
            <span className="data-key" style={{ color: '#bcc8e8' }}>获得产品</span>
            <span className="data-val" style={{ color: '#00ffd1', fontWeight: 700 }}>
              {PRODUCTS.find(p => p.drg === drgAmount)?.name || '自定义数量'}
            </span>
          </div>
          <div className="data-row">
            <span className="data-key" style={{ color: '#bcc8e8' }}>DRG 将销毁</span>
            <span className="data-val" style={{ color: '#ff6b6b', fontWeight: 700 }}>🔥 {drgAmount ? drgAmount.toLocaleString() : '0'} DRG</span>
          </div>

          <div style={{ marginTop: 20 }}>
            {rNeedsApprove && drgAmount ? (
              <button className="btn-accent" onClick={productApprove} disabled={rLoading} style={{ width: '100%', fontSize: 15, padding: '14px 0' }}>
                {rLoading ? '⏳ 授权中...' : '✅ 1. 授权 DRG'}
              </button>
            ) : (
              <button className="btn-primary-glow" onClick={productRedeem} disabled={rLoading || !drgAmount} style={{ width: '100%', fontSize: 15, padding: '14px 0' }}>
                {rLoading ? '⏳ 兑换中...' : '🛡️ 2. 确认兑换'}
              </button>
            )}
          </div>
        </div>

        {/* Burn Info */}
        <div style={{ maxWidth: 520, margin: '16px auto 0', background: 'linear-gradient(145deg, rgba(247,147,26,0.08), rgba(255,0,0,0.04))', border: '1px solid rgba(247,147,26,0.12)', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>🔥</span>
            <Text strong style={{ color: '#ffffff', fontSize: 14 }}>销毁机制</Text>
          </div>
          <Text style={{ fontSize: 13, color: '#ccd6f6', lineHeight: 1.7 }}>
            每次产品兑换所消耗的 DRG 将被永久销毁（发送至黑洞地址），减少总供应量，提升稀缺性。兑换成功后产品信息通过 NFT 形式发放到你的钱包。
          </Text>
        </div>
      </div>
      )}
    </PageShell>
  );
};

export default SwapPage;
