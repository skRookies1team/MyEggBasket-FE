// src/components/stock/chart/ChartLayout.tsx
import { useEffect, useState } from "react";

import type {
  Period,
  OrderBookData,
  StockPriceData,
} from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { ChartPanel } from "./ChartPanel";
import { OrderPanel } from "./OrderPanel";

import { fetchUserBalance } from "../../../api/accountApi";
import { useAuthStore } from "../../../store/authStore";

interface Props {
  period: Period;
  indicators: IndicatorState;
  data: StockPriceData[];
  orderBook: OrderBookData | null;
  currentPrice: number;
  stockCode: string;
  virtual?: boolean;
}

export function ChartLayout({
  period,
  indicators,
  data,
  orderBook,
  currentPrice,
  stockCode,
  virtual = false,
}: Props) {
  const isLogin = useAuthStore((state) => state.isAuthenticated);

  const [availableCash, setAvailableCash] = useState<number>(0);
  const [holdingQty, setHoldingQty] = useState<number>(0);
  const [avgPrice, setAvgPrice] = useState<number>(0);

  useEffect(() => {
    if (!isLogin) {
      setAvailableCash(0);
      setHoldingQty(0);
      setAvgPrice(0);
      return;
    }

    fetchUserBalance(virtual).then((res) => {

      const cash =
        Number(res?.summary?.d1CashAmount) ||
        Number(res?.summary?.totalCashAmount) ||
        0;

      setAvailableCash(cash);

      const matchedHolding = res?.holdings?.find(
        (holding: any) => holding?.stockCode === stockCode
      );

      setHoldingQty(
        Number(matchedHolding?.orderableQuantity) ||
          Number(matchedHolding?.quantity) ||
          0
      );
      setAvgPrice(Number(matchedHolding?.avgPrice) || 0);
    });
  }, [isLogin, stockCode, virtual]);

  return (
    <section
      className="
        grid grid-cols-1 gap-6
        xl:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]
      "
    >
      <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow">
        <ChartPanel
          period={period}
          indicators={indicators}
          data={data}
        />
      </div>

      <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow">
        <OrderPanel
          stockCode={stockCode}
          currentPrice={currentPrice}
          orderBook={orderBook}
          holdingQty={holdingQty}
          avgPrice={avgPrice}
          availableCash={availableCash}
          virtual={virtual}
        />
      </div>
    </section>
  );
}
