import { DollarSign } from 'lucide-react';

interface MyAssets {
    total: number;
    totalCash: number;
    D1Cash:number;
    D2Cash:number;
    profit: number;
    profitRate: number;
    stockEval: number;
}

interface AssetSummaryProps {
    assetData: MyAssets;
    loading: boolean;
}

export function ProtfolioSummary({ assetData, loading }: AssetSummaryProps) {
    const positiveColor = '#ff383c';
    const negativeColor = '#0066ff';

    // assetData가 없을 경우를 대비하여 기본값을 설정하거나 렌더링을 막습니다.
    if (!assetData) {
        return null; // 또는 로딩 상태를 표시할 수 있습니다.
    }

    const {  profit, profitRate, stockEval } = assetData || {};

    return (
        <div className="section-card">
            <div className="section-header">
                <DollarSign className="size-5 text-purple" />
                <h2 className="section-title">내 자산 현황</h2>
            </div>

            <div className="summary-grid">

                
                {/* 1. 주식 평가금액 (총자산 - 예수금) */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">주식 평가금액</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${stockEval.toLocaleString()}`}
                    </p>
                </div>


                {/* 2. 총 수익 / 수익률 */}
                <div className="summary-item bg-green-light">
                    <p className="summary-label">총 수익 / 수익률</p>
                    <div className="summary-value" style={{ color: profit >= 0 ? positiveColor : negativeColor }}>
                        {loading ? '-' : (
                            <>
                                {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                                <span style={{ fontSize: '16px', marginLeft: '6px', fontWeight: 500 }}>
                                    ({profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
                                </span>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}