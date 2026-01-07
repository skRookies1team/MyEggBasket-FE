import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Check, Pencil } from "lucide-react";
import { useFavoriteStore } from "../../store/favoriteStore";
// [중요] 아래 import 줄에 fetchTargetPriceByCode가 포함되어야 합니다.
import { fetchLowerTarget, fetchUpperTarget, fetchTargetPriceByCode } from "../../api/targetPriceApi";

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
}

export function StockHeader({
                              stockCode,
                              stockName,
                              currentPrice,
                              changeAmount,
                              changeRate,
                              onBack,
                              isLive = false,
                            }: StockHeaderProps) {
  const safeNum = (v?: number) =>
      typeof v === "number" && Number.isFinite(v) ? v : 0;

  const isPositive = safeNum(changeAmount) >= 0;
  const ColorIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-red-400" : "text-blue-400";

  /* ---------------- Target Price Logic ---------------- */
  const [upperPrice, setUpperPrice] = useState<string>("");
  const [lowerPrice, setLowerPrice] = useState<string>("");
  const [isUpperConfirmed, setIsUpperConfirmed] = useState(false);
  const [isLowerConfirmed, setIsLowerConfirmed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTarget = async () => {
      // API 호출
      const myTarget = await fetchTargetPriceByCode(stockCode);

      if (!isMounted) return;

      if (myTarget) {
        // 설정된 목표가가 있으면 설정
        if (myTarget.upperTarget) {
          setUpperPrice(myTarget.upperTarget.toString());
          setIsUpperConfirmed(true);
        }
        if (myTarget.lowerTarget) {
          setLowerPrice(myTarget.lowerTarget.toString());
          setIsLowerConfirmed(true);
        }
      } else {
        setUpperPrice((prev) => prev || (currentPrice > 0 ? Math.floor(currentPrice * 1.05).toString() : ""));
        setLowerPrice((prev) => prev || (currentPrice > 0 ? Math.floor(currentPrice * 0.95).toString() : ""));
      }
    };

    if (stockCode) {
      loadTarget();
    }

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockCode]);

  const handleUpperConfirm = async () => {
    if (!upperPrice) return;
    const res = await fetchUpperTarget(stockCode, Number(upperPrice));
    if (res) setIsUpperConfirmed(true);
  };

  const handleLowerConfirm = async () => {
    if (!lowerPrice) return;
    const res = await fetchLowerTarget(stockCode, Number(lowerPrice));
    if (res) setIsLowerConfirmed(true);
  };

  /* ---------------- Flash Effect ---------------- */
  const [flashClass, setFlashClass] = useState("");
  useEffect(() => {
    setFlashClass("bg-white/20");
    const timer = setTimeout(() => setFlashClass(""), 300);
    return () => clearTimeout(timer);
  }, [currentPrice]);

  /* ---------------- Favorite ---------------- */
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
    if (!stockCode || stockCode === "undefined") return;
    toggleFavorite(stockCode);
  };

  return (
      <header className="border-b border-[#232332] bg-gradient-to-b from-[#14141c] to-[#0a0a0f]">
        <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                  onClick={onBack}
                  className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-[#1f1f2e] hover:text-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex-1 mt-14 md:mt-3">
                <div className="mb-2 flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-100">{stockName}</h1>
                  <button onClick={handleToggleFavorite} className="rounded-md p-1 transition hover:bg-[#1f1f2e]">
                    <img src={isFavorite ? favoriteOn : favoriteOff} alt="favorite" className="h-5 w-5 transition-transform hover:scale-110" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <p className={`text-2xl font-bold text-gray-100 tabular-nums transition-colors duration-300 rounded px-1 -ml-1 ${flashClass}`}>
                    ₩{safeNum(currentPrice).toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-2 ${colorClass}`}>
                    <ColorIcon className="h-5 w-5" />
                    <span className="font-medium tabular-nums">
                      {isPositive ? "+" : ""}{safeNum(changeAmount).toLocaleString()} ({isPositive ? "+" : ""}{safeNum(changeRate)}%)
                    </span>
                  </div>
                  {isLive && (
                      <div className="ml-2 flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        LIVE
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* 목표가 설정 패널 (관심종목일 때만) */}
            {isFavorite && (
                <div className="mt-3 flex flex-col gap-2 rounded-xl bg-[#1a1a24]/50 p-4 border border-[#232332]">
                  <p className="text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">관심종목 알림 설정</p>

                  {/* 상한 */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-red-400 border border-red-400/30 px-1.5 py-0.5 rounded bg-red-400/5">상한</span>
                    {isUpperConfirmed ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200 text-sm font-semibold">{Number(upperPrice).toLocaleString()}원</span>
                          <button onClick={() => setIsUpperConfirmed(false)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <Pencil size={12} />
                          </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                          <input
                              type="number"
                              value={upperPrice}
                              onChange={(e) => setUpperPrice(e.target.value)}
                              className="w-24 rounded bg-[#0a0a0f] border border-[#2a2a35] px-2 py-1 text-right text-xs text-gray-200 focus:outline-none focus:border-red-500"
                          />
                          <button onClick={handleUpperConfirm} className="p-1 text-gray-500 hover:text-green-400"><Check size={16} /></button>
                        </div>
                    )}
                  </div>

                  {/* 하한 */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-blue-400 border border-blue-400/30 px-1.5 py-0.5 rounded bg-blue-400/5">하한</span>
                    {isLowerConfirmed ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200 text-sm font-semibold">{Number(lowerPrice).toLocaleString()}원</span>
                          <button onClick={() => setIsLowerConfirmed(false)} className="text-gray-500 hover:text-blue-400 transition-colors">
                            <Pencil size={12} />
                          </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                          <input
                              type="number"
                              value={lowerPrice}
                              onChange={(e) => setLowerPrice(e.target.value)}
                              className="w-24 rounded bg-[#0a0a0f] border border-[#2a2a35] px-2 py-1 text-right text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                          />
                          <button onClick={handleLowerConfirm} className="p-1 text-gray-500 hover:text-green-400"><Check size={16} /></button>
                        </div>
                    )}
                  </div>
                </div>
            )}
          </div>
        </div>
      </header>
  );
}