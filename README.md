# HKBTX — 金色香港 BTC 国际交易所 DApp

> 多链支持的 BTC 国际交易所 · 金色主题 · 面向全球用户的加密货币交易界面

## ✨ 功能

- **多链钱包** —— RainbowKit + wagmi 三件套，支持 MetaMask / WalletConnect / Coinbase Wallet
- **金色香港主题** —— 深空 + 金（#F7931A BTC 金）视觉
- **完整交易所模块**：
  - 💱 Swap 兑换
  - 📈 Staking 质押
  - 🗳️ DAO 治理
  - 🛡️ Redeem 赎回
  - 💰 Wallet 钱包
  - 🤝 Affiliate 联属推荐
  - ⚙️ Admin 管理
- **多语言** —— 20+ 语言支持
- **链支持** —— BSC 主网 / BSC 测试网 / 本地 Hardhat

## 🏗️ 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 18 + TypeScript + Vite |
| 钱包 | RainbowKit + wagmi + viem + ethers |
| 链 | BSC (BNB Smart Chain) |
| UI | Ant Design + 自建暗色组件 |

## 🚀 快速开始

```bash
npm install
npm run dev     # 开发
npm run build   # 构建
npm run preview # 预览构建产物
```

### 环境变量

复制 `.env.example` 为 `.env` 并填写：

```
# 在 https://cloud.walletconnect.com/sign-up 注册免费 Project ID
VITE_WALLETCONNECT_PROJECT_ID=你的_Project_ID
```

> ⚠️ 未配置 WalletConnect Project ID 时，WalletConnect 连接会自动禁用，MetaMask / Coinbase 仍可用。

## 📁 结构

```
src/
├── pages/         # 页面（Home/Swap/Staking/DAO/Wallet/Redeem/Affiliate/Admin/Origin）
├── components/    # 组件（Layout/Sidebar/TokenBadge/WalletButton 等）
├── contracts/     # 合约地址配置（本地部署地址）
├── hooks/         # useWallet / useContractData
├── contexts/      # 主题上下文
└── utils/         # abi / helpers / prices
```

## ☁️ 部署

```bash
npm run build
# dist/ 部署到任意静态托管（Cloudflare Pages / Vercel / Netlify）
```

## 📜 开源许可

本仓库基于 **MIT License** 开源（见 [LICENSE](./LICENSE)）。

> 合约源代码与生产部署地址为私有，不随本仓库公开。

---
**HKBTX** · 金色香港 BTC 国际交易所 · 权力来自被验证过的创新
