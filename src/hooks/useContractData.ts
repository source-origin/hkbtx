import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/address';
import { DRG_ABI, HLTH_ABI, STAKING_ABI } from '../utils/abi';

interface ContractData {
  loading: boolean;
  drgTotalSupply: string;
  drgPrice: string;
  poolBalance: string;
  totalStaked: string;
  stakingApr: string;
  userStakedBalance: string;
  userStakedRewards: string;
  referralPendingCommissions: string;
}

// Vite strips console.X in production via esbuild drop option
const DEBUG = import.meta.env.DEV;

export function useContractData(provider: ethers.providers.Web3Provider | null, account: string | null, chainId: number | null) {
  const [data, setData] = useState<ContractData>({
    loading: true, drgTotalSupply: '0', drgPrice: '0', poolBalance: '0',
    totalStaked: '0', stakingApr: '0', userStakedBalance: '0', userStakedRewards: '0',
    referralPendingCommissions: '0',
  });
  const timer = useRef<ReturnType<typeof setInterval>>();

  const fetch = useCallback(async () => {
    if (!provider || !chainId) return;
    try {
      setData(d => ({ ...d, loading: true }));
      const addrs = CONTRACT_ADDRESSES;
      const results: Partial<ContractData> = {};

      // DRG Total Supply
      try {
        const drg = new ethers.Contract(addrs.DRG, DRG_ABI, provider);
        const ts = await drg.totalSupply();
        results.drgTotalSupply = Number(ethers.utils.formatEther(ts)).toLocaleString(undefined, { maximumFractionDigits: 0 });
      } catch (e) { if (DEBUG) { console.error('useContractData: DRG totalSupply failed', e); } }

      // Reserve Pool USDT balance
      try {
        const usdt = new ethers.Contract(addrs.USDT, ['function balanceOf(address) view returns (uint256)'], provider);
        const bal = await usdt.balanceOf(addrs.ReservePool);
        results.poolBalance = Number(ethers.utils.formatUnits(bal, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 });
      } catch (e) { if (DEBUG) { console.error('useContractData: USDT balanceOf failed', e); } }

      // Staking
      try {
        const staking = new ethers.Contract(addrs.Staking, STAKING_ABI, provider);
        const [tvl, apr] = await Promise.all([
          staking.totalStaked().catch(() => ethers.BigNumber.from(0)),
          staking.apr().catch(() => ethers.BigNumber.from(0)),
        ]);
        results.totalStaked = Number(ethers.utils.formatEther(tvl)).toLocaleString(undefined, { maximumFractionDigits: 0 });
        results.stakingApr = (Number(ethers.utils.formatEther(apr)) / 100).toFixed(2);
      } catch (e) { if (DEBUG) { console.error('useContractData: staking stats failed', e); } }

      // User data
      if (account) {
        try {
          const staking = new ethers.Contract(addrs.Staking, STAKING_ABI, provider);
          const [staked, rewards] = await Promise.allSettled([
            staking.stakedBalance(account),
            staking.pendingRewards(account),
          ]);
          if (staked.status === 'fulfilled') results.userStakedBalance = Number(ethers.utils.formatEther(staked.value)).toLocaleString(undefined, { maximumFractionDigits: 2 });
          if (rewards.status === 'fulfilled') results.userStakedRewards = Number(ethers.utils.formatEther(rewards.value)).toLocaleString(undefined, { maximumFractionDigits: 4 });
        } catch (e) { if (DEBUG) { console.error('useContractData: user staking failed', e); } }
        // Referral commission
        try {
          const ref = new ethers.Contract(addrs.ReferralTreeV2, ['function getPendingCommissions(address) view returns (uint256)'], provider);
          const com = await ref.getPendingCommissions(account);
          results.referralPendingCommissions = Number(ethers.utils.formatEther(com)).toFixed(4);
        } catch (e) { if (DEBUG) { console.error('useContractData: referral commission failed', e); } }
      }

      setData(d => ({ ...d, ...results, loading: false }));
    } catch (e) {
      if (DEBUG) { console.error('useContractData: top-level fetch failed', e); }
      setData(d => ({ ...d, loading: false }));
    }
  }, [provider, account, chainId]);

  useEffect(() => {
    fetch();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(fetch, 30000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [fetch]);

  return data;
}
