import { useEffect, useState } from 'react';
import type { RiskLevel } from '../../types/portfolios';
import { fetchUserBalance } from '../../api/accountApi';
import type { AccountHolding } from '../../types/stock';
interface AddPortfolioModalProps {
    onClose: () => void;
    // 수정: Stock[] 대신 선택된 AccountHolding 객체 리스트를 전달하도록 타입 변경
    onAdd: (data: { 
        name: string, 
        riskLevel: RiskLevel, 
        totalAsset: 0, 
        cashBalance: 0, 
        selectedHoldings: AccountHolding[] // 새로운 필드명과 타입
    }) => void;
}

export function AddPortfolioModal({ onClose, onAdd }: AddPortfolioModalProps) {
    const [name, setName] = useState('');
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('MODERATE');
    const [selectedHoldings, setSelectedHoldings] = useState<AccountHolding[]>([]);
    const [holdings, setHoldings] = useState<AccountHolding[]>([]);
    const [loading, setLoading] = useState(true);

    const handleAdd = () => {
        if (!name.trim()) {
            alert('포트폴리오 이름을 입력해주세요.');
            return;
        }
        onAdd({ name, riskLevel, totalAsset: 0, cashBalance: 0, selectedHoldings });
        onClose(); 
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchUserBalance();
                if (data) {
                    setHoldings(data.holdings ?? []); 
                }
            } catch (error) {
                console.error("잔고 로딩 실패", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleStockSelection = (stockCode: string) => {
        const stockToToggle = holdings.find(h => h.stockCode === stockCode);

        if (!stockToToggle) return; 

        setSelectedHoldings(prev => {
            if (prev.some(h => h.stockCode === stockCode)) {
                return prev.filter(h => h.stockCode !== stockCode);
            } else {
                return [...prev, stockToToggle];
            }
        });
    };

    if (loading) return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p>보유 종목 로딩 중...</p>
            </div>
        </div>
    );

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>새 포트폴리오 추가</h2>

                {/* 포트폴리오 이름 입력 */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="portfolio-name" style={{ display: 'block', fontSize: '14px', color: '#49454f', marginBottom: '8px' }}>
                        포트폴리오 이름
                    </label>
                    <input
                        id="portfolio-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 나의 첫 번째 포트폴리오"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* 투자 성향 선택 */}
                <div style={{ marginBottom: '24px' }}>
                    <label htmlFor="risk-level" style={{ display: 'block', fontSize: '14px', color: '#49454f', marginBottom: '8px' }}>
                        투자 성향
                    </label>
                    <select
                        id="risk-level"
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            fontSize: '14px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="AGGRESSIVE">위험형 (고수익 추구)</option>
                        <option value="MODERATE">중립형 (균형 투자)</option>
                        <option value="CONSERVATIVE">안전형 (안정성 중시)</option>
                    </select>
                </div>

                {/* 보유 종목 선택 */}
                {holdings.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#49454f', marginBottom: '8px' }}>
                            포트폴리오에 추가할 보유 종목 선택
                        </label>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: '8px', padding: '8px' }}>
                            {holdings.map((stock: AccountHolding) => (
                                <div key={stock.stockCode} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                                    <input
                                        type="checkbox"
                                        id={`stock-${stock.stockCode}`}
                                        // 💡 수정: selectedHoldings 리스트에 해당 종목 코드가 있는지 확인
                                        checked={selectedHoldings.some(h => h.stockCode === stock.stockCode)}
                                        onChange={() => handleStockSelection(stock.stockCode)}
                                        style={{ marginRight: '12px' }}
                                    />
                                    <label htmlFor={`stock-${stock.stockCode}`} style={{ fontSize: '14px', color: '#1e1e1e' }}>
                                        {stock.stockName} ({stock.stockCode}) 
                                        {/* 💡 추가: 수량과 평단가를 표시하여 사용자가 확인할 수 있도록 함 */}
                                        <span style={{ marginLeft: '8px', color: '#666' }}>
                                            (수량: {stock.quantity}, 평단: {stock.avgPrice.toLocaleString()})
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {holdings.length === 0 && !loading && (
                    <div style={{ marginBottom: '24px', fontSize: '14px', color: '#888' }}>
                        추가할 수 있는 보유 종목이 없습니다.
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleAdd} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f378a', color: 'white', cursor: 'pointer' }}>
                        추가
                    </button>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3edf7', color: '#49454f', cursor: 'pointer' }}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}