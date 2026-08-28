import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { message } from 'antd';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { CHAIN_CONFIG, getContractAddresses } from '../contracts/address';
import { detectWalletName, translateError } from '../utils/helpers';

// ERC20 balanceOf + decimals ABI
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];

export interface WalletState {
  account: string | null;
  chainId: number | null;
  bnbBalance: string;
  drgBalance: string;
  hlthBalance: string;
  drgDecimals: number;
  hlthDecimals: number;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectChain: boolean;
  isLocalDev: boolean;
  walletName: string;
}

const REFRESH_MS = 15000;
const BSC_CHAIN_ID = 56;

/**
 * wagmi-bridged useWallet
 * 
 * Bridges wagmi account/chain state → ethers Provider/Signer
 * so all existing contract hooks (useContractData, etc.) continue to work.
 */
export function useWallet() {
  // ── wagmi hooks ──
  const { address, chainId: wagmiChainId, isConnected: wagmiConnected } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();

  const [state, setState] = useState<WalletState>({
    account: null, chainId: null, bnbBalance: '0', drgBalance: '0', hlthBalance: '0',
    drgDecimals: 18, hlthDecimals: 18, provider: null, signer: null,
    isConnecting: false, isConnected: false, isCorrectChain: false, isLocalDev: false, walletName: '',
  });
  const timer = useRef<ReturnType<typeof setInterval>>();

  // Build ethers provider/signer from wagmi state
  const buildProvider = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) return null;
    return new ethers.providers.Web3Provider(window.ethereum);
  }, []);

  // Fetch token balances
  const fetchTokens = useCallback(async (provider: ethers.providers.Provider, account: string, cid: number | null) => {
    try {
      const addrs = getContractAddresses(cid ?? 1337);
      const [drgBal, drgDec] = await (async () => {
        try {
          const c = new ethers.Contract(addrs.TokenDRG, ERC20_ABI, provider);
          return [await c.balanceOf(account), await c.decimals()];
        } catch {
          try {
            const c = new ethers.Contract(addrs.DRG, ERC20_ABI, provider);
            return [await c.balanceOf(account), await c.decimals()];
          } catch { return [ethers.BigNumber.from(0), 18 as number]; }
        }
      })();
      const [hlthBal, hlthDec] = await (async () => {
        try {
          const c = new ethers.Contract(addrs.TokenHLTH, ERC20_ABI, provider);
          return [await c.balanceOf(account), await c.decimals()];
        } catch {
          try {
            const c = new ethers.Contract(addrs.HLTH, ERC20_ABI, provider);
            return [await c.balanceOf(account), await c.decimals()];
          } catch { return [ethers.BigNumber.from(0), 18 as number]; }
        }
      })();
      const bnb = ethers.utils.formatEther(await provider.getBalance(account));
      setState(p => ({
        ...p, bnbBalance: bnb,
        drgBalance: ethers.utils.formatUnits(drgBal, drgDec),
        hlthBalance: ethers.utils.formatUnits(hlthBal, hlthDec),
        drgDecimals: drgDec, hlthDecimals: hlthDec,
      }));
    } catch { /* ignore */ }
  }, []);

  // ── Sync wagmi → ethers state ──
  useEffect(() => {
    if (wagmiConnected && address) {
      const cid = wagmiChainId ?? null;
      const provider = buildProvider();
      const signer = provider ? provider.getSigner() : null;
      const name = detectWalletName();

      setState(p => ({
        ...p,
        account: address,
        chainId: cid,
        provider,
        signer,
        isConnected: true,
        isCorrectChain: cid === BSC_CHAIN_ID,
        isLocalDev: cid === 1337,
        isConnecting: false,
        walletName: name || p.walletName,
      }));

      if (provider) {
        provider.getBalance(address).then(bnb => {
          setState(p => ({ ...p, bnbBalance: ethers.utils.formatEther(bnb) }));
        }).catch(() => {});
        fetchTokens(provider, address, cid);
      }
    } else if (!wagmiConnected) {
      if (timer.current) clearInterval(timer.current);
      setState(p => ({
        ...p,
        account: null, chainId: null, bnbBalance: '0', drgBalance: '0', hlthBalance: '0',
        drgDecimals: 18, hlthDecimals: 18, provider: null, signer: null,
        isConnected: false, isCorrectChain: false, isLocalDev: false, walletName: '',
      }));
    }
  }, [wagmiConnected, address, wagmiChainId, buildProvider, fetchTokens]);

  // Auto-refresh balances
  useEffect(() => {
    if (state.isConnected && state.provider && state.account) {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        if (state.provider && state.account) fetchTokens(state.provider, state.account, state.chainId);
      }, REFRESH_MS);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [state.isConnected, state.provider, state.account, state.chainId, fetchTokens]);

  // ── Public API (matches old useWallet interface) ──
  const connectWallet = useCallback(async () => {
    // Connect via wagmi → RainbowKit modal or direct MetaMask
    const injected = connectors.find(c => c.id === 'injected' || c.id === 'metaMask');
    if (injected) {
      wagmiConnect({ connector: injected });
    } else {
      message.warning('请安装 MetaMask 或其他钱包');
    }
  }, [wagmiConnect, connectors]);

  const switchToBSC = useCallback(async () => {
    wagmiSwitchChain({ chainId: BSC_CHAIN_ID });
  }, [wagmiSwitchChain]);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  const refresh = useCallback(() => {
    if (state.provider && state.account) fetchTokens(state.provider, state.account, state.chainId);
  }, [state.provider, state.account, state.chainId, fetchTokens]);

  // chainChanged 由 wagmi 内部管理，不需要手动 window.location.reload()

  return { ...state, connectWallet, switchToBSC: switchToBSC, disconnect, refresh };
}
