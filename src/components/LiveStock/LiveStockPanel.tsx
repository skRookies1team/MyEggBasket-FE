import { useState } from "react";
import LiveStockTabs from "../LiveStock/LiveStockTabs";
import LiveStockPeriodTabs from "../LiveStock/LiveStockPeriodTabs";
import LiveStockTable from "../LiveStock/LiveStockTable";
import { useFavoriteStore } from "../../store/favoriteStore";
import Basket1 from "../../assets/icons/basket1.png"
import Basket2 from "../../assets/icons/basket3.png";

import type { StockItem } from "../../types/stock.ts";

interface Props {
  data: {
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  };

}

export default function LiveStockPanel({ data}: Props) {
  const [category, setCategory] = useState<"volume" | "amount" | "rise" | "fall">("volume");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // 관심종목
  const favorites = useFavoriteStore((s) => s.favorites);
  const favoriteCodes = favorites.map((f) => f.stockCode);

  const filteredData = {
    volume: data.volume.filter((item) => favoriteCodes.includes(item.code)),
    amount: data.amount.filter((item) => favoriteCodes.includes(item.code)),
    rise: data.rise.filter((item) => favoriteCodes.includes(item.code)),
    fall: data.fall.filter((item) => favoriteCodes.includes(item.code)),
  };

  const finalData =
    onlyFavorites && favoriteCodes.length > 0 ? filteredData : data;

  const noFavorites = onlyFavorites && favoriteCodes.length === 0;

  return (
    <div style={{ marginTop: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>실시간 종목 주가</h2>

        {/* 이미지 토글 버튼 */}
        <div
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <img
            src={onlyFavorites ? Basket2 : Basket1}
            alt="favorites toggle"
            style={{
              width: "40px",
              height: "40px",
              transition: "transform 0.2s",
            }}
          />
          <span style={{ fontSize: "13px" }}>
            {onlyFavorites ? "관심종목만 보는 중" : "전체 종목 보기"}
          </span>
        </div>
      </div>

      {/* 정렬 탭 */}
      <LiveStockTabs selected={category} onChange={setCategory} />

      {/* 관심종목 없음 텍스트 */}
      {noFavorites ? (
        <div
          style={{
            padding: "20px 0",
            color: "#666",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          관심종목이 없습니다. 관심종목을 추가해주세요.
        </div>
      ) : (
        <LiveStockTable stocks={finalData[category]} category={category} />
      )}
    </div>
  );
}
