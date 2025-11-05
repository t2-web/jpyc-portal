import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DexTable from './DexTable';
import * as coingeckoLib from '../lib/coingecko';

// Mock the coingecko library
vi.mock('../lib/coingecko', () => ({
  fetchJpycDetailedData: vi.fn(),
  formatVolume: (volume: number) => `$${(volume / 1000).toFixed(1)}K`,
  mapChainName: (identifier: string) => {
    const chainMap: Record<string, string> = {
      'polygon': 'Polygon',
      'ethereum': 'Ethereum',
      'avalanche': 'Avalanche',
    };
    return chainMap[identifier.toLowerCase()] || identifier;
  },
}));

// Mock the icons module
vi.mock('./icons', () => ({
  getChainLogo: () => <span data-testid="chain-logo">🔗</span>,
}));

describe('DexTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(coingeckoLib.fetchJpycDetailedData).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<DexTable />);
    expect(screen.getByText('読み込み中...')).toBeTruthy();
  });

  it('should display DEX data when fetch succeeds', async () => {
    const mockData = {
      id: 'jpycoin',
      symbol: 'jpyc',
      name: 'JPY Coin',
      tickers: [
        {
          base: '0XE7C3D8C9A439FEDE00D2600032D5DB0BE71C3C29',
          target: '0X3C499C542CEF5E3811E1192CE70D8CC03D5C3359',
          market: {
            name: 'Uniswap V4 (Polygon)',
            identifier: 'uniswap-v4-polygon',
            has_trading_incentive: false,
          },
          last: 0.006397397309,
          volume: 8633400.27405362,
          converted_last: {
            usd: 0.00639611,
          },
          converted_volume: {
            usd: 55955,
          },
          trust_score: 'green',
          bid_ask_spread_percentage: 0.604751,
          timestamp: '2025-10-31T06:33:41+00:00',
          last_traded_at: '2025-10-31T06:33:41+00:00',
          last_fetch_at: '2025-10-31T06:35:53+00:00',
          is_anomaly: false,
          is_stale: false,
          trade_url: 'https://app.uniswap.org/#/swap',
          token_info_url: null,
          coin_id: 'jpycoin',
          target_coin_id: 'usd-coin',
        },
      ],
    };

    vi.mocked(coingeckoLib.fetchJpycDetailedData).mockResolvedValue(mockData);

    render(<DexTable />);

    await waitFor(() => {
      expect(screen.getByText('Uniswap V4 (Polygon)')).toBeTruthy();
    });

    expect(screen.getByText('Polygon')).toBeTruthy();
    expect(screen.getByText('$0.0064')).toBeTruthy();
    expect(screen.getByText('$56.0K')).toBeTruthy();
  });

  it('should display error message when fetch fails', async () => {
    vi.mocked(coingeckoLib.fetchJpycDetailedData).mockRejectedValue(
      new Error('API Error')
    );

    render(<DexTable />);

    await waitFor(() => {
      expect(screen.getByText('DEX情報の取得に失敗しました')).toBeTruthy();
    });
  });

  it('should display no data message when tickers array is empty', async () => {
    const mockData = {
      id: 'jpycoin',
      symbol: 'jpyc',
      name: 'JPY Coin',
      tickers: [],
    };

    vi.mocked(coingeckoLib.fetchJpycDetailedData).mockResolvedValue(mockData);

    render(<DexTable />);

    await waitFor(() => {
      expect(screen.getByText('データがありません')).toBeTruthy();
    });
  });

  it('should filter out stale and anomaly data', async () => {
    const mockData = {
      id: 'jpycoin',
      symbol: 'jpyc',
      name: 'JPY Coin',
      tickers: [
        {
          base: 'JPYC',
          target: 'USDC',
          market: {
            name: 'Good DEX',
            identifier: 'good-dex-polygon',
            has_trading_incentive: false,
          },
          last: 1.0,
          volume: 1000,
          converted_last: { usd: 1.0 },
          converted_volume: { usd: 1000 },
          trust_score: 'green',
          bid_ask_spread_percentage: 0.1,
          timestamp: '2025-10-31T00:00:00+00:00',
          last_traded_at: '2025-10-31T00:00:00+00:00',
          last_fetch_at: '2025-10-31T00:00:00+00:00',
          is_anomaly: false,
          is_stale: false,
          trade_url: 'https://example.com',
          token_info_url: null,
          coin_id: 'jpycoin',
          target_coin_id: 'usd-coin',
        },
        {
          base: 'JPYC',
          target: 'USDC',
          market: {
            name: 'Stale DEX',
            identifier: 'stale-dex-polygon',
            has_trading_incentive: false,
          },
          last: 1.0,
          volume: 1000,
          converted_last: { usd: 1.0 },
          converted_volume: { usd: 1000 },
          trust_score: 'green',
          bid_ask_spread_percentage: 0.1,
          timestamp: '2025-10-31T00:00:00+00:00',
          last_traded_at: '2025-10-31T00:00:00+00:00',
          last_fetch_at: '2025-10-31T00:00:00+00:00',
          is_anomaly: false,
          is_stale: true, // This should be filtered out
          trade_url: 'https://example.com',
          token_info_url: null,
          coin_id: 'jpycoin',
          target_coin_id: 'usd-coin',
        },
      ],
    };

    vi.mocked(coingeckoLib.fetchJpycDetailedData).mockResolvedValue(mockData);

    render(<DexTable />);

    await waitFor(() => {
      expect(screen.getByText('Good DEX')).toBeTruthy();
    });

    expect(screen.queryByText('Stale DEX')).toBeNull();
  });
});
