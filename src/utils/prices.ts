/**
 * HKBTC DApp 内部定价（神谕层）
 * 锚定汇率，不受外部市场影响
 */

// 锚定汇率：1 HLTH = 1 USDT
export const HLTH_TO_USD = 1.0;
export const HLTH_TO_USD_LABEL = '1 HLTH = 1 USDT (HKBTC锚定)';

// DRG 暂不锚定，浮动
export const DRG_TO_USD: number | null = null; // null = 无锚定
