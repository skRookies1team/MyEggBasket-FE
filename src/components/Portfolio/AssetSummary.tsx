import { DollarSign } from 'lucide-react';

interface AssetSummaryProps {
    total: number;
    stockEval: number;
    profit: number;
    profitRate: number;
    cash: number;
    d1Cash: number;  // D+1 예수금 (nxdy_excc_amt)
    d2Cash: number;  // D+2 예수금 (prvs_rcdl_excc_amt)
    loading: boolean;
}

export function AssetSummary({
                                 total,
                                 stockEval,
                                 profit,
                                 profitRate,
                                 cash,
                                 d1Cash,
                                 d2Cash,
                                 loading
                             }: AssetSummaryProps) {
    const positiveColor = '#ff383c';
    const negativeColor = '#0066ff';

    return (
        <div className="section-card">
            <div className="section-header">
                <DollarSign className="size-5 text-purple" />
                <h2 className="section-title">내 자산 현황</h2>
            </div>

            <div className="summary-grid">
                {/* 1. 총 자산 */}
                <div className="summary-item bg-purple-light">
                    <p className="summary-label">총 자산</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${total.toLocaleString()}`}
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

                {/* 3. 주식 평가금액 */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">주식 평가금액</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${stockEval.toLocaleString()}`}
                    </p>
                </div>

                {/* 4. 예수금 (주문가능) */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">예수금 (주문가능)</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${cash.toLocaleString()}`}
                    </p>
                    <p className="summary-label">D+1 예수금</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${d1Cash.toLocaleString()}`}
                    </p>
                    <p className="summary-label">D+2 예수금</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${d2Cash.toLocaleString()}`}
                    </p>
                </div>
            </div>
        </div>
    );
}