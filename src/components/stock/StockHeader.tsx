import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface StockHeaderProps {
  stockName: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;

  onBack: () => void;

  isLive?: boolean;
  lastUpdate?: string;
  askp1?: number;
  bidp1?: number;
  acmlVol?: number;
}

export function StockHeader({
  stockName,
  currentPrice,
  changeAmount,
  changeRate,
  onBack,
  isLive = false,
  lastUpdate,
  askp1,
  bidp1,
  acmlVol,
}: StockHeaderProps) {
  const safeNum = (v?: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : 0;

  const isPositive = safeNum(changeAmount) >= 0;
  const ColorIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-[#ff383c]' : 'text-[#0066ff]';

  return (
    <div className="bg-white border-b border-[#d9d9d9] p-6">
      <div className="max-w-[1600px] mx-auto flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[#f3edf7] rounded-lg">
          <ArrowLeft className="size-5" />
        </button>

        <div className="flex-1">
          <h1 className="text-[#1e1e1e] mb-2">{stockName}</h1>

          <div className="flex items-center gap-4">
            <p className="text-[24px]">₩{safeNum(currentPrice).toLocaleString()}</p>

            <div className="flex items-center gap-2">
              <ColorIcon className={`size-5 ${colorClass}`} />
              <span className={colorClass}>
                {isPositive ? '+' : ''}
                {safeNum(changeAmount).toLocaleString()} (
                {isPositive ? '+' : ''}
                {safeNum(changeRate)}%)
              </span>
            </div>

            {isLive && (
              <div className="ml-4 flex items-center gap-2 text-sm text-[#4f378a]">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                LIVE
                {lastUpdate && (
                  <span className="text-[12px] text-[#666]">
                    {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex gap-4 text-[13px] text-[#49454f]">
            {askp1 !== undefined && <span>매도1: ₩{safeNum(askp1).toLocaleString()}</span>}
            {bidp1 !== undefined && <span>매수1: ₩{safeNum(bidp1).toLocaleString()}</span>}
            {acmlVol !== undefined && <span>누적거래량: {safeNum(acmlVol).toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
