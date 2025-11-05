import { type CoinGeckoResponse, type CoinGeckoDetailedResponse } from '../types';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * CoinGecko APIからJPYCの価格データを取得
 */
export async function fetchJpycPrice(): Promise<CoinGeckoResponse> {
  const url = `${COINGECKO_API_BASE}/simple/price?ids=jpycoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoResponse = await response.json();
    console.log('💰 [CoinGecko] Price Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [CoinGecko] Failed to fetch price data:', error);
    throw error;
  }
}

/**
 * 価格をフォーマット (例: 0.00663564 → "$0.0066")
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  // 小数点以下の桁数を動的に決定
  const significantDigits = Math.ceil(-Math.log10(price)) + 2;
  return `$${price.toFixed(Math.min(significantDigits, 8))}`;
}

/**
 * ボリュームをフォーマット (例: 17528.96 → "$17.5K")
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(2)}`;
}

/**
 * ボリュームを円建てでフォーマット (例: 17528.96 → "¥2.6M")
 * @param volume USD建てのボリューム
 * @param usdJpyRate USD/JPYレート（デフォルト: 150）
 */
export function formatVolumeJPY(volume: number, usdJpyRate: number = 150): string {
  const volumeJPY = volume * usdJpyRate;
  if (volumeJPY >= 1_000_000_000) {
    return `¥${(volumeJPY / 1_000_000_000).toFixed(2)}B`;
  }
  if (volumeJPY >= 1_000_000) {
    return `¥${(volumeJPY / 1_000_000).toFixed(1)}M`;
  }
  if (volumeJPY >= 1_000) {
    return `¥${(volumeJPY / 1_000).toFixed(1)}K`;
  }
  return `¥${volumeJPY.toFixed(0)}`;
}

/**
 * 変化率をフォーマット (例: 0.301 → "+0.30%")
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * 時価総額をフォーマット (例: 7962754.48 → "$7.96M")
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  }
  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  }
  if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
}

/**
 * CoinGecko APIからJPYCの詳細情報（DEX情報を含む）を取得
 */
export async function fetchJpycDetailedData(): Promise<CoinGeckoDetailedResponse> {
  const url = `${COINGECKO_API_BASE}/coins/jpycoin`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoDetailedResponse = await response.json();
    console.log('📊 [CoinGecko] Detailed Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [CoinGecko] Failed to fetch detailed data:', error);
    throw error;
  }
}

/**
 * チェーン名をマッピング（識別子から表示名へ）
 */
export function mapChainName(identifier: string): string {
  const chainMap: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'avalanche': 'Avalanche',
    'avax': 'Avalanche',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism',
    'base': 'Base',
    'matic': 'Polygon',
  };

  const normalized = identifier.toLowerCase();
  return chainMap[normalized] || identifier;
}
