// Fix: Import React to use React.ReactNode type.
import React from 'react';

export type Tab = 'ホーム' | '分析' | 'エコシステム' | 'チュートリアル' | 'セキュリティ' | 'プライバシーポリシー' | '利用規約';

export interface ContractAddress {
  chain: string;
  name: string;
  address: string;
  explorerUrl: string;
}

export interface DeFiProtocol {
  name: string;
  logoUrl: string;
  description: string;
  category: 'スワップ' | 'レンディング' | 'ブリッジ' | '決済' | '寄付';
  link: string;
}

export interface EcosystemResource {
  name: string;
  description: string;
  category: '公式情報' | '導入ガイド' | 'コミュニティ';
  link: string;
}

export interface TutorialSection {
  title: string;
  content: {
    heading: string;
    text: string;
    imageUrl?: string;
  }[];
}

export type SupportedChain = 'Ethereum' | 'Polygon' | 'Avalanche';

export interface HolderAccount {
  rank: number;
  address: string;
  chain: SupportedChain;
  label?: string;
}

export interface ScamContract {
  name: string;
  chain: string;
  address: string;
  reportedAt: string;
  status: '無効化済み' | '調査中' | '注意喚起';
  note?: string;
}

export interface CoinGeckoPriceData {
  usd: number;
  usd_market_cap: number;
  usd_24h_vol: number;
  usd_24h_change: number;
}

export interface CoinGeckoResponse {
  jpycoin: CoinGeckoPriceData;
}

export interface DexTicker {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_last: {
    usd: number;
  };
  converted_volume: {
    usd: number;
  };
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
}

export interface CoinGeckoDetailedResponse {
  id: string;
  symbol: string;
  name: string;
  tickers: DexTicker[];
  market_data?: {
    current_price?: {
      usd: number;
    };
  };
}
