import { useState, useEffect, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type {
  AccountBalanceData,
  AccountHolding,
} from "../types/stock";

import { fetchUserBalance } from "../api/accountApi";
import { AssetSummary } from "../components/MyAssets/AssetSummary";
import { AssetCharts } from "../components/MyAssets/AssetCharts";
import AssetStockTrendCard from "../components/MyAssets/AssetStockTrendCard";
import { getStockInfoFromDB } from "../api/stocksApi";

export default function MyAssetPage() {
  const [balanceData, setBalanceData] =
      useState<AccountBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectorCompositionData, setSectorCompositionData] =
      useState<{ name: string; value: number; color: string }[]>([]);
  const [accountHoldings, setAccountHoldings] =
      useState<AccountHolding[]>([]);

  /* =========================
     잔고 로딩
  ========================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserBalance();
        if (data) {
          setBalanceData(data);
          // [수정 1] 데이터 로드 시점에 holdings 상태 업데이트 (null 체크 포함)
          setAccountHoldings(data.holdings || []);
        }
      } catch (error) {
        console.error("잔고 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* =========================
     자산 요약 계산
  ========================= */
  const myAssets = useMemo(() => {
    if (!balanceData) {
      return {
        total: 0,
        totalCash: 0,
        D1Cash: 0,
        D2Cash: 0,
        profit: 0,
        profitRate: 0,
        stockEval: 0,
      };
    }

    // [수정 2] useMemo 내부의 setState(setAccountHoldings) 제거
    const { summary } = balanceData;

    const total = summary.totalEvaluationAmount;
    const totalCash = summary.totalCashAmount;
    const D1Cash = summary.d1CashAmount;
    const D2Cash = summary.d2CashAmount;
    const stockEval = total - totalCash;
    const profit = summary.totalProfitLossAmount;

    const profitRate =
        stockEval > 0 ? (profit / (stockEval - profit)) * 100 : 0;

    return {
      total,
      totalCash,
      D1Cash,
      D2Cash,
      profit,
      profitRate,
      stockEval,
    };
  }, [balanceData]);

  /* =========================
     자산 구성 차트
  ========================= */
  const assetCompositionData = useMemo(() => {
    if (myAssets.total === 0) return [];
    return [
      {
        name: "주식",
        value: myAssets.stockEval,
        color: "#4f378a",
      },
      {
        name: "현금",
        value: myAssets.totalCash,
        color: "#00b050",
      },
    ];
  }, [myAssets]);

  /* =========================
     종목 비중 차트
  ========================= */
  const stockCompositionData = useMemo(() => {
    // [수정 3] accountHoldings가 null일 경우를 대비한 방어 코드 추가 (|| [])
    const validHoldings = (accountHoldings || []).filter(
        (h) => h.quantity > 0
    );
    if (validHoldings.length === 0) return [];

    const sorted = [...validHoldings].sort(
        (a, b) =>
            b.avgPrice * b.quantity - a.avgPrice * a.quantity
    );

    const top = sorted.slice(0, 4);
    const otherValue = sorted
        .slice(4)
        .reduce(
            (sum, h) => sum + h.avgPrice * h.quantity,
            0
        );

    const COLORS = [
      "#ff383c",
      "#4f378a",
      "#00b050",
      "#ffa500",
    ];

    const data = top.map((h, i) => ({
      name: h.stockName,
      value: h.avgPrice * h.quantity,
      color: COLORS[i % COLORS.length],
    }));

    if (otherValue > 0) {
      data.push({
        name: "기타",
        value: otherValue,
        color: "#9ca3af",
      });
    }

    return data;
  }, [accountHoldings]);

  /* =========================
     섹터 비중 차트
  ========================= */
  useEffect(() => {
    const calculateSectorComposition = async () => {
      // [수정 4] 여기도 null 체크 추가
      const validHoldings = (accountHoldings || []).filter(
          (h) => h.quantity > 0
      );
      if (validHoldings.length === 0) {
        setSectorCompositionData([]);
        return;
      }

      const results = await Promise.all(
          validHoldings.map(async (h) => {
            const info = await getStockInfoFromDB(h.stockCode);
            const sector =
                info?.sector && info.sector.trim() !== ""
                    ? info.sector
                    : "기타";
            return {
              sector,
              value: h.quantity * h.avgPrice,
            };
          })
      );

      const sectorMap: Record<string, number> = {};
      results.forEach(({ sector, value }) => {
        sectorMap[sector] = (sectorMap[sector] || 0) + value;
      });

      const COLORS = [
        "#4f378a",
        "#ffa500",
        "#0066ff",
        "#ff383c",
        "#00b050",
        "#00bcd4",
      ];

      const finalData = Object.entries(sectorMap)
          .map(([name, value], idx) => ({
            name,
            value,
            color:
                name === "기타"
                    ? "#9ca3af"
                    : COLORS[idx % COLORS.length],
          }))
          .sort((a, b) => b.value - a.value);

      setSectorCompositionData(finalData);
    };

    calculateSectorComposition();
  }, [accountHoldings]);

  /* =========================
     렌더링
  ========================= */
  return (
      <div className="min-h-screen bg-[#0a0a0f] px-4 py-6">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* [수정 5] accountHoldings 존재 여부 확인 강화 */}
          {accountHoldings && accountHoldings.length > 0 && (
              <>
                {/* 1. 자산 요약 */}
                <AssetSummary assetData={myAssets} loading={loading} />

                {/* 2. 차트 영역 */}
                <AssetCharts
                    assetData={assetCompositionData}
                    stockData={stockCompositionData}
                    sectorData={sectorCompositionData}
                />

                {/* 3. 보유 종목 추이 */}
                <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c]
                            p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <h3 className="text-sm font-semibold tracking-wide text-purple-300">
                      내 보유 주식 추이
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6
                              sm:grid-cols-2
                              lg:grid-cols-3">
                    {accountHoldings
                        .filter((h) => h.quantity > 0)
                        .map((stock) => (
                            <AssetStockTrendCard
                                key={stock.stockCode}
                                stockCode={stock.stockCode}
                                name={stock.stockName}
                                quantity={stock.quantity}
                                avgPrice={stock.avgPrice}
                            />
                        ))}
                  </div>
                </div>
              </>
          )}
        </div>
      </div>
  );
}