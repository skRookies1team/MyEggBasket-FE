import { useState } from 'react';

// 지표 정의 (상수)
const INDICATOR_OPTIONS = [
    { id: 'eps', label: '연도별 주당 순수익 (EPS)', category: 'fundamental' },
    { id: 'revenue', label: '연도별 매출', category: 'fundamental' },
    { id: 'profit', label: '연도별 이익', category: 'fundamental' },
    { id: 'valuation', label: '저평가/고평가 지표', category: 'fundamental' },
    { id: 'ma', label: '이동평균선', category: 'technical' },
    { id: 'volume_profile', label: '매물대', category: 'technical' },
    { id: 'bollinger', label: '볼린저 밴드', category: 'technical' },
    { id: 'stochastic', label: '스토캐스틱', category: 'technical' },
    { id: 'macd', label: 'MACD', category: 'technical' },
    { id: 'rsi', label: 'RSI', category: 'technical' },
];

export function StockIndicators() {
    const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

    const toggleIndicator = (id: string) => {
        setSelectedIndicators(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                <h3 className="text-[#1e1e1e] mb-4">보조 지표 선택</h3>

                {['fundamental', 'technical'].map(category => (
                    <div key={category} className="mb-6 last:mb-0">
                        <h4 className="text-[#49454f] text-[14px] mb-3 capitalize">
                            {category === 'fundamental' ? '기본 지표' : '기술적 지표'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {INDICATOR_OPTIONS.filter(ind => ind.category === category).map((indicator) => (
                                <label key={indicator.id} className="flex items-center gap-3 p-3 border border-[#e8e8e8] rounded-lg hover:bg-[#f3edf7] cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedIndicators.includes(indicator.id)}
                                        onChange={() => toggleIndicator(indicator.id)}
                                        className="w-4 h-4 text-[#4f378a] border-[#d9d9d9] rounded focus:ring-[#4f378a]"
                                    />
                                    <span className="text-[#1e1e1e] text-[14px]">{indicator.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedIndicators.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                    <h3 className="text-[#1e1e1e] mb-4">선택된 지표 상세</h3>
                    <div className="text-[#49454f] text-sm">
                        {/* 실제 구현 시 선택된 지표에 따른 컴포넌트나 데이터를 여기서 렌더링 */}
                        API 연동 후 선택된 지표({selectedIndicators.join(', ')}) 데이터를 이곳에 표시합니다.
                    </div>
                </div>
            )}
        </div>
    );
}