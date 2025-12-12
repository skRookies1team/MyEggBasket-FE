import { useState } from 'react';
import type { Holding } from '../../types/portfolios';
interface PortfolioStockListProps {
    // stocks는 Holding[] 타입이거나 null/undefined일 수 있습니다.
    stocks: Holding[] | null | undefined; 
}

export function PortfolioStockList({ stocks }: PortfolioStockListProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // ✅ 핵심 수정: stocks가 null/undefined이거나 빈 배열일 경우 렌더링을 완전히 막습니다.
    const validStocks = stocks ?? []; 

    if (validStocks.length === 0) {
        // AI 추천 종목이 없을 때, 섹션 자체가 아예 보이지 않도록 null을 반환합니다.
        // PortfolioPage에서 렌더링 조건을 추가했더라도, 여기서 한 번 더 체크하는 것이 안전합니다.
        return null; 
        
        /* 만약 섹션 제목만이라도 표시하고 싶다면, 아래 코드를 사용합니다.
        return (
            <div style={{ marginTop: '24px', borderTop: '1px solid #d9d9d9', paddingTop: '24px' }}>
                <h3 className="section-title" style={{ marginBottom: '16px' }}>AI 추천 종목 상세 (참고용)</h3>
                <p style={{ color: '#888' }}>현재 포트폴리오에 추천 종목이 없습니다.</p>
            </div>
        );
        */
    }


    return (
        <div style={{ marginTop: '24px', borderTop: '1px solid #d9d9d9', paddingTop: '24px' }}>
            {/* ... (이하 기존 코드 유지) */}
            <h3 className="section-title" style={{ marginBottom: '16px' }}>AI 추천 종목 상세 (참고용)</h3>

            {/* stocks 대신 validStocks 사용 */}
            {validStocks.map((stock, index) => ( 
                // ... (종목 상세 리스트 렌더링)
                <div key={index} className="stock-card">
                    {/* ... */}
                </div>
            ))}
        </div>
    );
}