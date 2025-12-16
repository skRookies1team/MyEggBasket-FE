import { useEffect, useState } from 'react';
import { useHistoryStore, useHoldingStore, usePortfolioStore } from '../../store/historyStore';

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";

import HistoryReport from './HistoryReport';
import { DollarSign } from 'lucide-react';
import type { Portfolio } from '../../types/portfolios';
import { fetchStockCurrentPrice } from '../../api/liveStockApi';

interface Props {
  portfolioId: number | null;
}

interface HoldingStockRowProps {
  holdingStock: any;
}

function HoldingStockRow({ holdingStock }: HoldingStockRowProps) {
  const [stockData, setStockData] = useState<{
    currentPrice: number;
    profit: number;
    rate: number;
  } | null>(null);

  useEffect(() => {
    async function getStockData() {
      const data = await fetchStockCurrentPrice(holdingStock.stock.stockCode);
      if (data) {
        const currentPrice = data.currentPrice;
        const profit = (currentPrice - holdingStock.avgPrice) * holdingStock.quantity;
        const rate = holdingStock.avgPrice > 0 ? ((currentPrice - holdingStock.avgPrice) / holdingStock.avgPrice) * 100 : 0;
        setStockData({ currentPrice, profit, rate });
      }
    }
    getStockData();

    const intervalId = setInterval(getStockData, 1000); // 1초마다 데이터 갱신

    return () => {
      clearInterval(intervalId);
    };
  }, [holdingStock]);

  if (!stockData) {
    return (
      <tr className="border-b border-[#f3edf7]">
        <td className="py-3 px-4 text-[#1e1e1e]">{holdingStock.stock.name}</td>
        <td colSpan={5} className="py-3 px-4 text-center text-gray-500">현재가 불러오는 중...</td>
      </tr>
    );
  }

  const { currentPrice, profit, rate } = stockData;

  return (
    <tr className="border-b border-[#f3edf7] hover:bg-[#f3edf7]/50 transition-colors">
      <td className="py-3 px-4 text-[#1e1e1e]">{holdingStock.stock.name}</td>
      <td className="py-3 px-4 text-right text-[#49454f]">{holdingStock.quantity}</td>
      <td className="py-3 px-4 text-right text-[#49454f]">{holdingStock.avgPrice.toLocaleString()}원</td>
      <td className="py-3 px-4 text-right text-[#1e1e1e]">{currentPrice.toLocaleString()}원</td>
      <td className={`py-3 px-4 text-right font-medium ${profit > 0 ? 'text-red-500' : profit < 0 ? 'text-blue-600' : 'text-gray-800'}`}>{profit > 0 ? '+' : ''}{profit.toLocaleString()}원</td>
      <td className={`py-3 px-4 text-right font-medium ${rate > 0 ? 'text-red-500' : rate < 0 ? 'text-blue-600' : 'text-gray-800'}`}>{rate > 0 ? '+' : ''}{rate.toFixed(2)}%</td>
    </tr>
  );
}

export default function HistoryAsset({ portfolioId }: Props) {

  const portfolios = usePortfolioStore((state) => state.portfolioList);
  const portfolio: Portfolio | undefined = portfolios.find(
    (p) => p.portfolioId === portfolioId
  );

  const history = useHistoryStore((state) => state.historyReport);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);

  const holdings = useHoldingStore((state) => state.holdingList);
  const fetchHoldings = useHoldingStore((state) => state.fetchHoldings)

  useEffect(() => {
    if (portfolioId !== null) {
      fetchHistory(portfolioId);
      fetchHoldings(portfolioId);
    }
  }, [portfolioId, fetchHistory, fetchHoldings]);

  if (!portfolio) {
    return (
      <div className="p-6 text-center text-gray-500">
        포트폴리오 정보를 불러오는 중입니다...
      </div>
    );
  }

  const successRate = history?.successRate ?? null;

  const totalStockValue = holdings.reduce((sum, stock) => sum + stock.avgPrice * stock.quantity, 0);
  const totalAsset = totalStockValue + (portfolio.cashBalance ?? 0);

  let eggIcon = null;
  if (successRate !== null) {
    eggIcon =
      successRate >= 10 ? (
        <img src={Egg1} alt="Good Egg" className="w-8 h-8 ml-2" />
      ) : (
        <img src={Egg2} alt="Bad Egg" className="w-8 h-8 ml-2" />
      );
  }

  return (
    <div className="flex space-x-4">
      <div className="w-1/2 text-white">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">{portfolio.name}</h2>
              {eggIcon}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              위험 수준:{' '}
              <span className="font-semibold text-blue-600">
                {portfolio.riskLevel}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="text-gray-600">주식 현재 평가 금액</p>
              <p className="text-lg font-bold text-gray-800">
                {totalAsset.toLocaleString()}원
              </p>
            </div>
          </div>
          <hr className="h-px my-8 bg-gray-300 border-0" />
          <div className="mt-6">
            <HistoryReport history={history} />
          </div>
        </div>
      </div>
      <div className="w-1/2 text-white">
        {/* RQ-45: 주식 건당 수익 */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-[#4f378a]" />
            <h2 className="text-2xl font-bold text-gray-800">종목별 수익 현황</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e8e8]">
                  <th className="text-left py-3 px-4 text-[#49454f] text-[13px]">종목명</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">보유수량</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">매입가</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">현재가</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">수익금액</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">수익률</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holdingStock) => (
                  <HoldingStockRow key={holdingStock.stock.stockCode} holdingStock={holdingStock} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}