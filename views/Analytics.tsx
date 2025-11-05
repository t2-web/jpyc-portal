import React from 'react';
import { priceChartData, holderChartData, CONTRACT_ADDRESSES } from '../constants';
import CustomLineChart from '../components/LineChart';
import SwapWidget from '../components/SwapWidget';
import Card from '../components/Card';
// DEX情報はホームページに移動したため、インポートを削除
// import DexTable from '../components/DexTable';
import { ExternalLinkIcon, CopyIcon, getChainLogo } from '../components/icons';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">データと分析</h1>
        <p className="text-on-surface-secondary">オンチェーン指標や価格推移など、JPYC の最新データを確認できます。</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomLineChart 
          data={priceChartData} 
          xAxisKey="name" 
          lines={[{ key: 'price', color: '#00BCD4' }, { key: 'volume', color: '#FFC107' }]} 
          title="価格と出来高 (USD)" 
          comingSoon
        />
        <CustomLineChart 
          data={holderChartData} 
          xAxisKey="name" 
          lines={[{ key: 'holders', color: '#8884d8' }]}
          title="保有者推移"
          comingSoon
        />
      </section>
      
      {/* DEX情報はホームページに移動したため、このセクションを削除 */}
      {/* <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <DexTable />
        </div>
        <div>
            <SwapWidget />
        </div>
      </section> */}
      
      <section>
        <Card>
            <h2 className="text-xl font-semibold mb-4 text-on-surface">主要コントラクトアドレス</h2>
            <div className="space-y-3">
                {CONTRACT_ADDRESSES.map(ca => (
                    <div key={ca.chain} className="bg-background p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {getChainLogo(ca.chain)}
                            <span className="font-bold">{ca.name} ({ca.chain})</span>
                            <span className="font-mono text-sm text-on-surface-secondary break-all">{ca.address}</span>
                        </div>
                        <div className="flex items-center">
                            <CopyIcon onClick={() => navigator.clipboard.writeText(ca.address)} />
                            <a href={ca.explorerUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </section>
    </div>
  );
};

export default Analytics;
