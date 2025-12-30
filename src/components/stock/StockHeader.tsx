import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useFavoriteStore } from "../../store/favoriteStore";

import favoriteOn from "../../assets/icons/egg3.png";
import favoriteOff from "../../assets/icons/egg2.png";

interface StockHeaderProps {
  stockCode: string;
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
                              stockCode,
                              stockName,
                              currentPrice,
                              changeAmount,
                              changeRate,
                              onBack,
                              isLive = false,
                              askp1,
                              bidp1,
                              acmlVol,
                            }: StockHeaderProps) {
  /* ---------------- util ---------------- */
  const safeNum = (v?: number) =>
      typeof v === "number" && Number.isFinite(v) ? v : 0;

  const isPositive = safeNum(changeAmount) >= 0;
  const ColorIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-red-400" : "text-blue-400";

  /* ---------------- Flash Effect ---------------- */
  // 가격 변경 시 깜빡임 효과를 위한 상태
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    // 가격(currentPrice)이 변할 때마다 효과 적용
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlashClass("bg-white/20");
    const timer = setTimeout(() => setFlashClass(""), 300); // 0.3초 후 복구
    return () => clearTimeout(timer);
  }, [currentPrice]);

  /* ---------------- favorite ---------------- */
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);

  const isFavorite = useMemo(
      () => favorites.some((f) => f.stockCode === stockCode),
      [favorites, stockCode]
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggleFavorite = () => {
    if (!stockCode || stockCode === "undefined") {
      console.error("❌ 잘못된 stockCode:", stockCode);
      return;
    }
    toggleFavorite(stockCode);
  };

  return (
      <header className="border-b border-[#232332] bg-gradient-to-b from-[#14141c] to-[#0a0a0f]">
        <div className="mx-auto max-w-[1600px] px-4 py-6">
          <div className="flex items-start gap-4">
            <button
                onClick={onBack}
                className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-[#1f1f2e] hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex-1 mt-14 md:mt-3">
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-100">
                  {stockName}
                </h1>
                <button
                    onClick={handleToggleFavorite}
                    className="rounded-md p-1 transition hover:bg-[#1f1f2e]"
                    title={isFavorite ? "관심 종목 해제" : "관심 종목 추가"}
                >
                  <img
                      src={isFavorite ? favoriteOn : favoriteOff}
                      alt={isFavorite ? "관심 종목" : "관심 종목 아님"}
                      className="h-5 w-5 select-none transition-transform hover:scale-110"
                      draggable={false}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* 가격 표시 부분에 flashClass 적용 */}
                <p
                    className={`text-2xl font-bold text-gray-100 tabular-nums transition-colors duration-300 rounded px-1 -ml-1 ${flashClass}`}
                >
                  ₩{safeNum(currentPrice).toLocaleString()}
                </p>

                <div className={`flex items-center gap-2 ${colorClass}`}>
                  <ColorIcon className="h-5 w-5" />
                  <span className="font-medium tabular-nums">
                  {isPositive ? "+" : ""}
                    {safeNum(changeAmount).toLocaleString()} (
                    {isPositive ? "+" : ""}
                    {safeNum(changeRate)}%)
                </span>
                </div>

                {/* LIVE 배지 */}
                {isLive && (
                    <div className="ml-2 flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      LIVE
                    </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                {/* (기존 호가/거래량 정보 유지) */}
                {askp1 !== undefined && (
                    <span>매도1: <span className="tabular-nums text-gray-300">₩{safeNum(askp1).toLocaleString()}</span></span>
                )}
                {bidp1 !== undefined && (
                    <span>매수1: <span className="tabular-nums text-gray-300">₩{safeNum(bidp1).toLocaleString()}</span></span>
                )}
                {acmlVol !== undefined && (
                    <span>누적거래량: <span className="tabular-nums text-gray-300">{safeNum(acmlVol).toLocaleString()}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}