// File: `src/components/Portfolio/AssetSummary.tsx`
import { DollarSign } from 'lucide-react';

interface AssetSummaryProps {
    total: number;
    investment: number;
    profit: number;
    profitRate: number;
    cash: number;
    loading: boolean;
}

export function AssetSummary({ total, investment, profit, profitRate, cash, loading }: AssetSummaryProps) {
    // 양수는 빨간색, 음수는 파란색
    const positiveColor = '#ff383c';
    const negativeColor = '#0066ff';

    return (
        <div className="section-card">
            <div className="section-header">
                <DollarSign className="size-5 text-purple" />
                <h2 className="section-title">내 자산 현황</h2>
            </div>

            <div className="summary-grid">
                <div className="summary-item bg-purple-light">
                    <p className="summary-label">총 자산</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${total.toLocaleString()}`}
                    </p>
                    <p style={{ fontSize: '13px', color: profitRate >= 0 ? positiveColor : negativeColor }}>
                        {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                    </p>
                </div>
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">투자 금액 (추산)</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${investment.toLocaleString()}`}
                    </p>
                </div>
                <div className="summary-item bg-green-light">
                    <p className="summary-label">총 수익</p>
                    <p className="summary-value" style={{ color: profit >= 0 ? positiveColor : negativeColor }}>
                        {loading ? '-' : `${profit >= 0 ? '+' : ''}₩${profit.toLocaleString()}`}
                    </p>
                </div>
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">예수금 (현금)</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${cash.toLocaleString()}`}
                    </p>
                </div>
            </div>
        </div>
    );
}