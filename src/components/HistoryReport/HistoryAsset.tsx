import { useEffect } from 'react';
import { useHistoryStore, usePortfolioStore } from '../../store/historyStore';
import type { Portfolio } from '../../store/historyStore';

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";

import HistoryReport from './HistoryReport';

interface Props {
  portfolioId: number | null;
}

export default function HistoryAsset({ portfolioId }: Props) {
  const portfolios = usePortfolioStore((state) => state.portfolioList);
  const portfolio: Portfolio | undefined = portfolios.find(
    (p) => p.portfolioId === portfolioId
  );

  const history = useHistoryStore((state) => state.historyReport);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);

  useEffect(() => {
    if (portfolioId !== null) {
      fetchHistory(portfolioId);
    }
  }, [portfolioId, fetchHistory]);

  if (!portfolio) {
    return (
      <div className="p-6 text-center text-gray-500">
        포트폴리오 정보를 불러오는 중입니다...
      </div>
    );
  }

  const successRate = history?.successRate ?? null;

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
          <p className="text-gray-600">총 자산</p>
          <p className="text-lg font-bold text-gray-800">
            {portfolio.totalAsset?.toLocaleString() ?? 0}원
          </p>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
          <p className="text-gray-600">예수금</p>
          <p className="text-lg font-bold text-gray-800">
            {portfolio.cashBalance?.toLocaleString() ?? 0}원
          </p>
        </div>
      </div>

      <div className="mt-6">
        <HistoryReport history={history} />
      </div>
    </div>
  );
}
