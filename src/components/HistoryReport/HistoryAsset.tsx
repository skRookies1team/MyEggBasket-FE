import { useEffect, useState } from "react";
import {
  useHistoryStore,
  useHoldingStore,
  usePortfolioStore,
} from "../../store/historyStore";

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";

import HistoryReport from "./HistoryReport";
import { DollarSign } from "lucide-react";
import type { Portfolio } from "../../types/portfolios";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";

interface Props {
  portfolioId: number | null;
}

interface HoldingStockRowProps {
  holdingStock: any;
}

/* =========================
   개별 종목 Row
========================= */
function HoldingStockRow({ holdingStock }: HoldingStockRowProps) {
  const [stockData, setStockData] = useState<{
    currentPrice: number;
    profit: number;
    rate: number;
  } | null>(null);

  useEffect(() => {
    async function getStockData() {
      const data = await fetchStockCurrentPrice(
        holdingStock.stock.stockCode
      );
      if (data) {
        const currentPrice = data.currentPrice;
        const profit =
          (currentPrice - holdingStock.avgPrice) *
          holdingStock.quantity;
        const rate =
          holdingStock.avgPrice > 0
            ? ((currentPrice - holdingStock.avgPrice) /
                holdingStock.avgPrice) *
              100
            : 0;
        setStockData({ currentPrice, profit, rate });
      }
    }

    getStockData();
    const id = setInterval(getStockData, 1000);
    return () => clearInterval(id);
  }, [holdingStock]);

  if (!stockData) {
    return (
      <tr className="border-b border-[#232332]">
        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
          {holdingStock.stock.name}
        </td>
        <td
          colSpan={5}
          className="px-4 py-3 text-center text-gray-500"
        >
          현재가 불러오는 중...
        </td>
      </tr>
    );
  }

  const { currentPrice, profit, rate } = stockData;
  const color =
    profit > 0
      ? "text-red-400"
      : profit < 0
      ? "text-blue-400"
      : "text-gray-300";

  return (
    <tr className="border-b border-[#232332] hover:bg-[#1f1f2e] transition">
      {/* 종목명 */}
      <td className="px-4 py-3 text-gray-200 whitespace-nowrap">
        {holdingStock.stock.name}
      </td>

      {/* 보유수량 */}
      <td className="px-4 py-3 text-right text-gray-400 tabular-nums whitespace-nowrap min-w-[80px]">
        {holdingStock.quantity.toLocaleString()}
      </td>

      {/* 매입가 */}
      <td className="px-4 py-3 text-right text-gray-400 tabular-nums whitespace-nowrap min-w-[100px]">
        {holdingStock.avgPrice.toLocaleString()}원
      </td>

      {/* 현재가 */}
      <td className="px-4 py-3 text-right text-gray-200 tabular-nums whitespace-nowrap min-w-[100px]">
        {currentPrice.toLocaleString()}원
      </td>


      {/* 수익률 */}
      <td className={`px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap min-w-[90px] ${color}`}>
        {rate > 0 ? "+" : ""}
        {rate.toFixed(2)}%
      </td>
    </tr>
  );
}

/* =========================
   메인 컴포넌트
========================= */
export default function HistoryAsset({ portfolioId }: Props) {
  const portfolios = usePortfolioStore((s) => s.portfolioList);
  const portfolio: Portfolio | undefined = portfolios.find(
    (p) => p.portfolioId === portfolioId
  );

  const history = useHistoryStore((s) => s.historyReport);
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);

  const holdings = useHoldingStore((s) => s.holdingList);
  const fetchHoldings = useHoldingStore((s) => s.fetchHoldings);

  const [totalStockValue, setTotalStockValue] = useState(0);

  useEffect(() => {
    if (portfolioId !== null) {
      fetchHistory(portfolioId);
      fetchHoldings(portfolioId);
    }
  }, [portfolioId, fetchHistory, fetchHoldings]);

  useEffect(() => {
    const calc = async () => {
      if (holdings.length === 0) {
        setTotalStockValue(0);
        return;
      }

      const prices = await Promise.all(
        holdings.map((h) =>
          fetchStockCurrentPrice(h.stock.stockCode)
        )
      );

      const total = prices.reduce((sum, p, i) => {
        const price = p?.currentPrice ?? 0;
        return sum + price * holdings[i].quantity;
      }, 0);

      setTotalStockValue(total);
    };

    calc();
  }, [holdings]);

  if (!portfolio) {
    return (
      <div className="rounded-xl bg-[#1a1a24] p-6 text-center text-gray-400">
        포트폴리오 정보를 불러오는 중입니다...
      </div>
    );
  }

  const successRate = history?.successRate ?? null;
  const eggIcon =
    successRate !== null ? (
      <img
        src={successRate >= 10 ? Egg1 : Egg2}
        className="ml-2 h-7 w-7"
        alt="egg"
      />
    ) : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ---------- LEFT ---------- */}
      <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 border-b border-[#232332] pb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-100">
              {portfolio.name}
            </h2>
            {eggIcon}
          </div>
          <p className="mt-1 text-sm text-gray-400">
            위험 수준:
            <span className="ml-1 font-semibold text-indigo-400">
              {portfolio.riskLevel}
            </span>
          </p>
        </div>

        <div className="rounded-lg bg-[#1f1f2e] p-4">
          <p className="text-sm text-gray-400">
            주식 현재 평가 금액
          </p>
          <p className="mt-1 text-lg font-bold text-gray-100">
            {totalStockValue.toLocaleString()}원
          </p>
        </div>

        <div className="mt-6">
          <HistoryReport history={history} />
        </div>
      </div>

      {/* ---------- RIGHT ---------- */}
      <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            종목별 수익 현황
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#232332] text-gray-400">
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  종목명
                </th>
                <th className="px-4 py-3 text-right min-w-[80px] whitespace-nowrap">
                  보유수량
                </th>
                <th className="px-4 py-3 text-right min-w-[100px] whitespace-nowrap">
                  매입가
                </th>
                <th className="px-4 py-3 text-right min-w-[100px] whitespace-nowrap">
                  현재가
                </th>
                <th className="px-4 py-3 text-right min-w-[90px] whitespace-nowrap">
                  수익률
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <HoldingStockRow
                  key={h.stock.stockCode}
                  holdingStock={h}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
