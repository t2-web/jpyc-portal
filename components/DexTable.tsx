import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getChainLogo } from './icons';
import { fetchJpycDetailedData, formatVolume, mapChainName } from '../lib/coingecko';
import { JPYC_CONTRACT_ADDRESSES } from '../lib/onchain';
import type { DexTicker } from '../types';

interface DexTableRow {
  dex: string;
  chain: string;
  pair: string;
  price: number;
  volume: number;
  tradeUrl: string;
}

/**
 * UniswapのトークンエクスプローラーページURLを生成
 * 形式: https://app.uniswap.org/explore/tokens/{chain}/{contract_address}
 */
function generateUniswapUrl(chain: string): string {
  // チェーン名をUniswapのURL形式に変換
  const chainMap: Record<string, string> = {
    'Ethereum': 'ethereum',
    'Polygon': 'polygon',
    'Avalanche': 'avalanche',
    'Arbitrum': 'arbitrum',
    'Optimism': 'optimism',
    'Base': 'base',
  };

  const uniswapChain = chainMap[chain] || chain.toLowerCase();
  
  // JPYCコントラクトアドレスを取得
  // チェーン名が一致しない場合は、デフォルトでPolygonのアドレスを使用
  const contractAddress = JPYC_CONTRACT_ADDRESSES[chain as keyof typeof JPYC_CONTRACT_ADDRESSES] 
    || JPYC_CONTRACT_ADDRESSES.Polygon;

  return `https://app.uniswap.org/explore/tokens/${uniswapChain}/${contractAddress.toLowerCase()}`;
}

const DexTable: React.FC = () => {
  const [dexData, setDexData] = useState<DexTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDexData = async () => {
      try {
        setLoading(true);
        const data = await fetchJpycDetailedData();

        // tickers データを処理
        const processedData: DexTableRow[] = data.tickers
          .filter((ticker: DexTicker) => {
            // DEXのみをフィルタ（信頼スコアが green または yellow のもの）
            const hasGoodTrustScore = ticker.trust_score === 'green' || ticker.trust_score === 'yellow';
            // 異常値や古いデータを除外
            const isValidData = !ticker.is_anomaly && !ticker.is_stale;

            return hasGoodTrustScore && isValidData;
          })
          .map((ticker: DexTicker) => {
            // identifierからチェーンを抽出（uniswap-v4-polygon や uniswap_v3_polygon_pos などに対応）
            const identifier = ticker.market.identifier;
            let chainIdentifier = '';

            if (identifier.includes('ethereum')) {
              chainIdentifier = 'ethereum';
            } else if (identifier.includes('polygon')) {
              chainIdentifier = 'polygon';
            } else if (identifier.includes('avalanche') || identifier.includes('avax')) {
              chainIdentifier = 'avalanche';
            } else if (identifier.includes('arbitrum')) {
              chainIdentifier = 'arbitrum';
            } else if (identifier.includes('optimism')) {
              chainIdentifier = 'optimism';
            } else {
              // フォールバック: 最後の部分を使用
              const parts = identifier.split(/[-_]/);
              chainIdentifier = parts[parts.length - 1] || parts[0];
            }

            // ペア名を取得（target_coin_idから）
            const pairMap: Record<string, string> = {
              'usd-coin': 'USDC',
              'tether': 'USDT',
              'jpycoin': 'JPYC',
              'wrapped-bitcoin': 'WBTC',
              'ethereum': 'ETH',
            };
            const targetSymbol = pairMap[ticker.target_coin_id] || ticker.target_coin_id.toUpperCase();

            const mappedChain = mapChainName(chainIdentifier);
            
            return {
              dex: ticker.market.name,
              chain: mappedChain,
              pair: `JPYC/${targetSymbol}`,
              price: ticker.converted_last.usd,
              volume: ticker.converted_volume.usd,
              // UniswapのトークンエクスプローラーページURLを生成
              tradeUrl: generateUniswapUrl(mappedChain),
            };
          })
          // 取引高でソート（降順）
          .sort((a, b) => b.volume - a.volume)
          // 上位10件のみ
          .slice(0, 10);

        setDexData(processedData);
        setError(null);
      } catch (err) {
        console.error('DEX data fetch error:', err);
        setError('DEX情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDexData();

    // 5分ごとに更新
    const interval = setInterval(fetchDexData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-on-surface">DEX情報</h2>
        <div className="text-center py-8 text-on-surface-secondary">
          読み込み中...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-on-surface">DEX情報</h2>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  if (dexData.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-on-surface">DEX情報</h2>
        <div className="text-center py-8 text-on-surface-secondary">
          データがありません
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 text-on-surface">DEX情報</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3">DEX</th>
              <th className="p-3">チェーン</th>
              <th className="p-3">ペア</th>
              <th className="p-3">価格 (USD)</th>
              <th className="p-3">取引高 (24h)</th>
              <th className="p-3">リンク</th>
            </tr>
          </thead>
          <tbody>
            {dexData.map((item, index) => (
              <tr
                key={`${item.dex}-${item.chain}-${item.pair}-${index}`}
                className="border-b border-border last:border-b-0 hover:bg-background"
              >
                <td className="p-3 font-medium">{item.dex}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {getChainLogo(item.chain)}
                    {item.chain}
                  </div>
                </td>
                <td className="p-3 text-on-surface-secondary">{item.pair}</td>
                <td className="p-3 text-primary">
                  ${item.price.toFixed(4)}
                </td>
                <td className="p-3">{formatVolume(item.volume)}</td>
                <td className="p-3">
                  <a
                    href={item.tradeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    取引
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-on-surface-secondary">
        データ提供: CoinGecko API | 5分ごとに更新
      </div>
    </Card>
  );
};

export default DexTable;
