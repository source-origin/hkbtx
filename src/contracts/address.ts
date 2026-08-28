// ================================================================
// HKBTX DApp — 合约地址配置 v7.1
// 部署时间: 2026-07-19 本地 Hardhat
// ================================================================

const LOCALHOST_ADDRESSES = {
  // Tokens
  MockUSDT: '0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb',
  USDT: '0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb',
  TokenDRG: '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
  DRG: '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
  TokenHLTH: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
  HLTH: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',

  // Core
  Vault: '0xAA292E8611aDF267e563f334Ee42320aC96D0463',
  DistributorV2: '0xf953b3A269d80e3eB0F2947630Da976B896A8C5b',
  ReservePool: '0xA4899D35897033b927acFCf422bc745916139776',
  Reward: '0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3',

  // Product
  ProductNFT: '0x4631BCAbD6dF18D94796344963cB60d44a4136b6',
  DRGRedeemV2: '0xD5ac451B0c50B9476107823Af206eD814a2e2580',
  DRGRedeem: '0xD5ac451B0c50B9476107823Af206eD814a2e2580',

  // Staking
  Staking: '0xe8D2A1E88c91DCd5433208d4152Cc4F399a7e91d',

  // Referral (v7.1: ReferralEngine)
  Tree: '0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D',
  ReferralTreeV2: '0xc96304e3c037f81dA488ed9dEa1D8F2a48278a75',
  ReferralEngine: '0xF8e31cb472bc70500f08Cd84917E5A1912Ec8397',

  // Governance
  TimeLock: '0x34B40BA116d5Dec75548a9e9A8f15411461E8c70',
  HLTH_Gov: '0xD0141E899a65C95a556fE2B27e5982A6DE7fDD7A',
  DAOTreasury: '0x07882Ae1ecB7429a84f1D53048d35c4bB2056877',

  // Admin
  AdminManager: '0x3347B4d90ebe72BeFb30444C9966B2B990aE9FcB',
  AdminManagerV2: '0x3347B4d90ebe72BeFb30444C9966B2B990aE9FcB',

  // Misc
  DualTurbine: '0x22753E4264FDDc6181dc7cce468904A80a363E44',
  SimpleSwap: '0xA7c59f010700930003b33aB25a7a0679C860f29c',
  HKBTXRouter: '0xfaAddC93baf78e89DCf37bA67943E1bE8F37Bb8c',
  DataProvider: '0x3155755b79aA083bd953911C92705B7aA82a18F9',
  HarvestHelper: '0x5bf5b11053e734690269C6B9D438F8C9d48F528A',
};

// BSC主网(56)合约地址 —— 仅HLTH已部署，其余29个合约待部署
const MAINNET_ADDRESSES = {
  ...LOCALHOST_ADDRESSES,
  // 真实BSC主网地址 ↓
  TokenHLTH: '0x0000000000000000000000000000000000000000',
  HLTH: '0x0000000000000000000000000000000000000000',
};
// BSC测试网(97)暂用localhost地址
const TESTNET_ADDRESSES = { ...LOCALHOST_ADDRESSES };

export const ALL_ADDRESSES: Record<number, typeof LOCALHOST_ADDRESSES> = {
  1337: LOCALHOST_ADDRESSES,
  56: MAINNET_ADDRESSES,
  97: TESTNET_ADDRESSES,
};

export const CONTRACT_ADDRESSES = LOCALHOST_ADDRESSES;

export const CHAIN_CONFIG = {
  BSC: {
    chainId: 56,
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
};

export function getContractAddresses(chainId: number): typeof LOCALHOST_ADDRESSES {
  return ALL_ADDRESSES[chainId] || LOCALHOST_ADDRESSES;
}
