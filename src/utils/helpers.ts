import { ethers } from 'ethers';

/**
 * HKBTX 工具函数
 */

/**
 * 格式化代币金额（显示可读格式）
 */
export function formatTokenAmount(
  amount: ethers.BigNumber | string | number,
  decimals: number = 6
): string {
  if (!amount) return '0.00';
  const value = typeof amount === 'string' || typeof amount === 'number'
    ? ethers.BigNumber.from(amount)
    : amount;
  return ethers.utils.formatUnits(value, decimals);
}

/**
 * 解析代币金额（从显示格式到合约精度）
 */
export function parseTokenAmount(
  amount: string,
  decimals: number = 6
): ethers.BigNumber {
  try {
    return ethers.utils.parseUnits(amount, decimals);
  } catch {
    return ethers.BigNumber.from('0');
  }
}

/**
 * 截断地址
 */
export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  if (address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化余额显示
 */
export function formatBalance(
  balance: ethers.BigNumber | undefined,
  decimals: number = 6,
  symbol: string = ''
): string {
  if (!balance) return `0.00 ${symbol}`.trim();
  const formatted = ethers.utils.formatUnits(balance, decimals);
  const parts = formatted.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] ? parts[1].slice(0, 2).padEnd(2, '0') : '00';
  return `${integerPart}.${decimalPart} ${symbol}`.trim();
}

/**
 * 格式化代币余额，大数字自动缩写
 * >= 10000 显示缩写 1.23万
 */
export function formatTokenBalance(val: string | number, decimals: number = 18): string {
  if (!val || val === '0') return '0';
  let formatted: string;
  try {
    formatted = ethers.utils.formatUnits(val.toString(), decimals);
  } catch {
    // 已格式化的值（如 formatEther 结果），直接使用
    formatted = val.toString();
  }
  const num = parseFloat(formatted);
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  if (num < 0.0001) return '<0.0001';
  return num.toFixed(4);
}

/**
 * 复制文本到剪贴板
 */
export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 获取区块链浏览器地址链接
 */
export function getBlockExplorerUrl(chainId: number | null, address: string): string {
  if (!address) return '';
  const explorerMap: Record<number, string> = {
    56: 'https://bscscan.com',
    97: 'https://testnet.bscscan.com',
  };
  const baseUrl = chainId ? explorerMap[chainId] : '';
  if (!baseUrl) return '';
  return `${baseUrl}/address/${address}`;
}

/**
 * 获取链的名称为友好显示
 */
export function getChainDisplayName(chainId: number | null): string {
  const names: Record<number, string> = {
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    1337: 'Hardhat Local',
    1: 'Ethereum',
    5: 'Goerli',
  };
  return chainId ? names[chainId] || `Chain ${chainId}` : 'Unknown';
}

/**
 * 检测钱包品牌
 */
export function detectWalletName(): string {
  if (typeof window === 'undefined' || !window.ethereum) return '';
  const e = window.ethereum;
  if (e.isMetaMask) return 'MetaMask';
  if (e.isTokenPocket) return 'TokenPocket';
  if (e.isTrust) return 'Trust Wallet';
  if (e.isBraveWallet) return 'Brave Wallet';
  if (e.isCoinbaseWallet) return 'Coinbase Wallet';
  return 'Wallet';
}

/**
 * 获取钱包品牌图标标签（简写）
 */
export function getWalletIcon(walletName: string): string {
  const icons: Record<string, string> = {
    MetaMask: '🦊',
    TokenPocket: '📱',
    'Trust Wallet': '🛡️',
    'Brave Wallet': '🦁',
    'Coinbase Wallet': '🔵',
  };
  return icons[walletName] || '💳';
}

/**
 * 检查是否TP钱包
 */
export function isTokenPocket(): boolean {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const ethereum = (window as any).ethereum;
    return (
      ethereum.isTokenPocket ||
      ethereum.isTP ||
      !!ethereum.tp ||
      (ethereum.chainId && ethereum.isConnected && !ethereum.isMetaMask)
    );
  }
  return false;
}

/**
 * 检查是否支持连接
 */
export function hasWalletProvider(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
}

/**
 * 获取Tier显示信息
 */
export function getTierInfo(points: number): { label: string; color: string } {
  if (points >= 290278) return { label: '黄金肝盾', color: '#FFD700' };
  if (points >= 138889) return { label: '白银肝盾', color: '#C0C0C0' };
  if (points >= 19167) return { label: '青铜肝盾', color: '#CD7F32' };
  return { label: '未评级', color: '#999999' };
}

/**
 * 错误信息中文映射
 */
export function translateError(error: any): string {
  if (!error) return '未知错误';

  const message = error?.reason || error?.data?.message || error?.message || String(error);

  if (message.includes('user rejected') || message.includes('User denied')) {
    return '用户取消了交易';
  }
  if (message.includes('insufficient funds')) {
    return '余额不足';
  }
  if (message.includes('execution reverted')) {
    const reason = message.split('reverted: ')[1] || '';
    return `交易失败: ${reason}`;
  }
  if (message.includes('network')) {
    return '网络错误，请检查连接';
  }

  return message.length > 100 ? '交易执行失败' : message;
}
