import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import type { Period } from '../../types/stock';

interface StockHeaderProps {
    stockName: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    period: Period;
    onPeriodChange: (p: Period) => void;
    onBack: () => void;
    isLive?: boolean;
    lastUpdate?: string | undefined;
    askp1?: number | undefined;
    bidp1?: number | undefined;
    acmlVol?: number | undefined;
}

export function StockHeader({
                                stockName,
                                currentPrice,
                                changeAmount,
                                changeRate,
                                period,
                                onPeriodChange,
                                onBack,
                                isLive = false,
                                lastUpdate,
                                askp1,
                                bidp1,
                                acmlVol,
                            }: StockHeaderProps) {
    const isPositive = changeAmount >= 0;
    const ColorIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-[#ff383c]' : 'text-[#0066ff]';

    return (
        <div className="bg-white border-b border-[#d9d9d9] p-6">
            <div className="max-w-[1600px] mx-auto flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-[#f3edf7] rounded-lg transition-colors">
                    <ArrowLeft className="size-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-[#1e1e1e] mb-2">{stockName}</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-[#1e1e1e] text-[24px]">₩{currentPrice.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                            <ColorIcon className={`size-5 ${colorClass}`} />
                            <span className={colorClass}>
                {isPositive ? '+' : ''}{changeAmount.toLocaleString()} ({isPositive ? '+' : ''}{changeRate}%)
              </span>
                        </div>
                        {/* 실시간 상태 표시 */}
                        {isLive && (
                            <div className="ml-4 text-sm flex items-center gap-2 text-[#4f378a]">
                                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                                <span>LIVE</span>
                                {lastUpdate && <span className="text-[12px] text-[#666]">{new Date(lastUpdate).toLocaleTimeString()}</span>}
                            </div>
                        )}
                    </div>
                    {/* 호가/합계 거래량 간단 표시 */}
                    <div className="mt-2 flex items-center gap-4 text-[13px] text-[#49454f]">
                        {askp1 !== undefined && <span>매도1: ₩{askp1.toLocaleString()}</span>}
                        {bidp1 !== undefined && <span>매수1: ₩{bidp1.toLocaleString()}</span>}
                        {acmlVol !== undefined && <span>누적거래량: {acmlVol.toLocaleString()}</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    {(['minute', 'day', 'week', 'month', 'year'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                period === p ? 'bg-[#eaddff] text-[#4f378a]' : 'bg-[#f3edf7] text-[#49454f]'
                            }`}
                        >
                            {p === 'minute' ? '분' : p === 'day' ? '일' : p === 'week' ? '주' : p === 'month' ? '월' : '년'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}