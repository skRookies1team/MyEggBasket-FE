import { DollarSign } from 'lucide-react';
import { fetchUserBalance } from '../../api/accountApi';
import { useEffect, useState} from 'react';
import type { Holding } from '../../store/historyStore';

interface Balance {
    totalEvaluationAmount: number
    totalProfitLoss: number
    cashAmount: number
    netAssetAmount: number
    profitRate: number
    holdings: Holding

}

export function AssetSummary() {
    const positiveColor = '#ff383c';
    const negativeColor = '#0066ff';

    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getBalance = async () => {
            try {
                const res = await fetchUserBalance();
                if (res.ok) {
                    setBalance(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getBalance();
    }, []);

    // balance 상태가 변경될 때마다 실행
    useEffect(() => {
        if (balance) {
            console.log('✨ balance 상태 업데이트 확인:', balance);
        }
    }, [balance]);

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
                        {loading ? '-' : `₩${balance?.totalEvaluationAmount.toLocaleString() ?? 0}`}
                    </p>
                </div>

                {/* 2. 총 수익 / 수익률 */}
                <div className="summary-item bg-green-light">
                    <p className="summary-label">총 수익 / 수익률</p>
                    <div className="summary-value" style={{ color: (balance?.totalProfitLoss ?? 0) >= 0 ? positiveColor : negativeColor }}>
                        {loading ? '-' : (
                            <>
                                {(balance?.totalProfitLoss ?? 0) > 0 ? '+' : ''}{(balance?.totalProfitLoss ?? 0).toLocaleString()}
                                <span style={{ fontSize: '16px', marginLeft: '6px', fontWeight: 500 }}>
                                    ({(balance?.profitRate ?? 0) >= 0 ? '+' : ''}{(balance?.profitRate ?? 0).toFixed(2)}%)
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. 주식 평가금액 (총자산 - 예수금) */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">주식 평가금액</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${((balance?.totalEvaluationAmount ?? 0) - (balance?.cashAmount ?? 0)).toLocaleString()}`}
                    </p>
                </div>

                {/* 4. 예수금 (주문가능) */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">예수금 (주문가능)</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${balance?.cashAmount.toLocaleString() ?? 0}`}
                    </p>
                    <p className="summary-label">D+1 예수금</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${balance?.cashAmount.toLocaleString() ?? 0}`}
                    </p>
                    <p className="summary-label">D+2 예수금</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${balance?.cashAmount.toLocaleString() ?? 0}`}
                    </p>
                </div>
            </div>
        </div>
    );
}