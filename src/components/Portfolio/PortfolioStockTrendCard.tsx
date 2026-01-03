import { useEffect, useState } from "react";
import type { StockPriceData } from "../../types/stock";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { fetchHistoricalData } from "../../api/stocksApi";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Info } from "lucide-react"; // 아이콘 활용

interface Props {
    stockCode: string;
    name: string;
    quantity: number;
    avgPrice: number;
    profitRate?: number; // 부모에서 계산해서 넘겨준 수익률
    aiAnalysis?: string; // [추가] AI 분석 텍스트
    aiScore?: number;    // [추가] AI 점수
}

export default function StockTrendCard({
                                           stockCode,
                                           name,
                                           quantity,
                                           avgPrice,
                                           profitRate: parentProfitRate,
                                           aiAnalysis,
                                           aiScore,
                                       }: Props) {
    const [chartData, setChartData] = useState<StockPriceData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [changeRate, setChangeRate] = useState<number>(0);

    /* =========================
       데이터 로딩
    ========================= */
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                const [history, current] = await Promise.all([
                    fetchHistoricalData(stockCode, "day"),
                    fetchStockCurrentPrice(stockCode),
                ]);

                if (!mounted) return;

                if (history && history.length > 0) {
                    const normalized = [...history]
                        .sort(
                            (a, b) =>
                                new Date(a.time).getTime() - new Date(b.time).getTime()
                        )
                        .map((d) => ({
                            ...d,
                            time: String(d.time),
                            close: Number(d.close),
                            price: Number(d.close),
                        }))
                        .slice(-30);

                    setChartData(normalized);
                } else {
                    setChartData([]);
                }

                if (current) {
                    setCurrentPrice(current.currentPrice);
                    setChangeRate(current.changeRate);
                }
            } catch (e) {
                console.error("StockTrendCard load error:", e);
            }
        };

        loadData();
        return () => {
            mounted = false;
        };
    }, [stockCode]);

    /* =========================
       수익 계산
    ========================= */
    // 부모에서 profitRate를 받았다면 그것을 사용, 아니면 현재가 기준으로 계산
    // (현재가 로딩 전에는 0으로 표시될 수 있음)
    const calcProfitRate =
        avgPrice > 0 && currentPrice > 0
            ? ((currentPrice - avgPrice) / avgPrice) * 100
            : 0;

    const finalProfitRate =
        parentProfitRate !== undefined ? parentProfitRate : calcProfitRate;

    // 수익금(추정)
    const profitAmount = (avgPrice * quantity * finalProfitRate) / 100;

    const isUp = changeRate >= 0;
    const isProfit = finalProfitRate >= 0;

    const lineColor = isUp ? "#ff383c" : "#3ca8ff";

    /* =========================
       렌더링
    ========================= */
    return (
        <div
            className="flex h-full flex-col justify-between rounded-2xl
                    bg-gradient-to-b from-[#1a1a24] to-[#14141c]
                    p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
            {/* ---------- 상단 ---------- */}
            <div className="mb-3">
                <div className="flex items-center justify-between">
                    <h3 className="mb-1 text-sm font-semibold text-gray-100">{name}</h3>
                    {/* AI 점수 뱃지 표시 (값이 있을 때만) */}
                    {aiScore !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            aiScore >= 70 ? "border-red-500 text-red-400" :
                                aiScore >= 40 ? "border-yellow-500 text-yellow-400" :
                                    "border-blue-500 text-blue-400"
                        }`}>
                    AI {aiScore}점
                </span>
                    )}
                </div>

                <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-white">
                        {currentPrice ? `₩${currentPrice.toLocaleString()}` : "-"}
                    </p>

                    {currentPrice > 0 && (
                        <p
                            className={`text-sm font-semibold ${
                                isUp ? "text-red-400" : "text-blue-400"
                            }`}
                        >
                            {isUp ? "+" : ""}
                            {changeRate}%
                        </p>
                    )}
                </div>
            </div>

            {/* ---------- 차트 ---------- */}
            <div className="mb-3 h-[100px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#2e2e44"
                                vertical={false}
                            />
                            <YAxis hide domain={["auto", "auto"]} />
                            <Tooltip
                                formatter={(value: number) => [
                                    `₩${value.toLocaleString()}`,
                                    "주가",
                                ]}
                                labelFormatter={(label) => {
                                    // 날짜 포맷팅 안전하게 처리
                                    const d = new Date(label);
                                    if(isNaN(d.getTime())) return label;
                                    return `${d.getMonth() + 1}/${d.getDate()}`;
                                }}
                                contentStyle={{
                                    backgroundColor: "#14141c",
                                    borderRadius: "8px",
                                    border: "1px solid #2e2e44",
                                    color: "#e5e7eb",
                                    fontSize: "12px",
                                }}
                                itemStyle={{ color: "#e5e7eb" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="close"
                                stroke={lineColor}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div
                        className="flex h-full items-center justify-center
                          text-xs text-gray-400"
                    >
                        데이터 로딩중...
                    </div>
                )}
            </div>

            {/* ---------- 하단 ---------- */}
            <div
                className="flex justify-between border-t border-[#2e2e44]
                      pt-3 text-xs"
            >
        <span className="text-gray-400">
          {quantity.toLocaleString()}주 · 평단 ₩{avgPrice.toLocaleString()}
        </span>

                <span
                    className={`font-semibold ${
                        isProfit ? "text-red-400" : "text-blue-400"
                    }`}
                >
          {isProfit ? "+" : ""}
                    ₩{Math.round(profitAmount).toLocaleString()} (
                    {isProfit ? "+" : ""}
                    {finalProfitRate.toFixed(2)}%)
        </span>
            </div>
        </div>
    );
}