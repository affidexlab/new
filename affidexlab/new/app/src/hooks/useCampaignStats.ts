import { useCallback, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

export interface GlobalStats {
  totalTrades: number;
  totalVolumeUsd: number;
  uniqueWallets: number;
  tvl: number;
}

export interface CampaignStats {
  dailyTrades: number;
  dailyVolumeUsd: number;
  weeklyVolumeUsd: number;
  prizePoolUsd: number;
  privacySwapsToday: number;
  activeMultipliers: number;
  pioneerTraders?: number;
  updatedAt: string;
}

const DEFAULT_GLOBAL_STATS: GlobalStats = {
  totalTrades: 0,
  totalVolumeUsd: 0,
  uniqueWallets: 0,
  tvl: 0
};

const DEFAULT_CAMPAIGN_STATS: CampaignStats = {
  dailyTrades: 0,
  dailyVolumeUsd: 0,
  weeklyVolumeUsd: 0,
  prizePoolUsd: 0,
  privacySwapsToday: 0,
  activeMultipliers: 0,
  updatedAt: new Date(0).toISOString()
};

export function useCampaignStats(pollInterval = 30000) {
  const [globalStats, setGlobalStats] = useState<GlobalStats>(DEFAULT_GLOBAL_STATS);
  const [campaignStats, setCampaignStats] = useState<CampaignStats>(DEFAULT_CAMPAIGN_STATS);
  const [loading, setLoading] = useState(true);

  const fetchGlobalStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/points/metrics`);
      if (!response.ok) {
        throw new Error('Failed to load global stats');
      }
      const data = await response.json();
      if (data.success && data.data) {
        const resolvedVolume = typeof data.data.totalVolumeUsd === 'number'
          ? data.data.totalVolumeUsd
          : typeof data.data.totalVolume === 'number'
            ? data.data.totalVolume
            : 0;

        setGlobalStats({
          totalTrades: data.data.totalTrades || 0,
          totalVolumeUsd: resolvedVolume,
          uniqueWallets: data.data.uniqueWallets || 0,
          tvl: data.data.tvl || 0
        });
      } else {
        setGlobalStats(DEFAULT_GLOBAL_STATS);
      }
    } catch (error) {
      console.error('Failed to fetch global stats', error);
      setGlobalStats(DEFAULT_GLOBAL_STATS);
    }
  }, []);

  const fetchCampaignStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/points/campaign-metrics`);
      if (!response.ok) {
        throw new Error('Failed to load campaign metrics');
      }
      const data = await response.json();
      if (data.success && data.data) {
        setCampaignStats({ ...DEFAULT_CAMPAIGN_STATS, ...data.data });
      } else {
        setCampaignStats(DEFAULT_CAMPAIGN_STATS);
      }
    } catch (error) {
      console.error('Failed to fetch campaign stats', error);
      setCampaignStats(DEFAULT_CAMPAIGN_STATS);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchGlobalStats(), fetchCampaignStats()]);
    } finally {
      setLoading(false);
    }
  }, [fetchGlobalStats, fetchCampaignStats]);

  useEffect(() => {
    refresh();
    if (!pollInterval) return;
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, refresh]);

  return { globalStats, campaignStats, loading, refresh };
}
