import { useFavoriteStore } from "../../store/favoriteStore";
import { useNavigate } from "react-router-dom";
import type { StockItem } from "../../types/stock";
import "../../assets/LiveStock/LiveStockTable.css";

interface Props {
  stocks: StockItem[];
  category: "volume" | "amount" | "rise" | "fall";
}

export default function LiveStockTable({ stocks, category }: Props) {
  const { favorites, toggleFavorite } = useFavoriteStore();
  const navigate = useNavigate();

  function formatToEok(amount: number) {
    return (amount / 100_000_000).toFixed(1);
  }
  return (
    <table className="live-stock-table">
      <thead>
        <tr>
          <th></th>
          <th>순위</th>
          <th>종목명</th>
          <th>현재가</th>
          <th>등락률</th>

          {category === "volume" && <th>거래량</th>}
          {category === "amount" && <th>거래대금</th>}
        </tr>
      </thead>

      <tbody>
        {stocks.map((s, idx) => {
          const isFav = favorites.includes(s.code);

          return (
            <tr
              key={s.code}
              className="clickable-row"
              onClick={() => navigate(`/stock/${s.code}`)}
            >
              {/* 관심종목 */}
              <td className="fav-col">
                <button
                  className={`fav-btn ${isFav ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(s.code);
                  }}
                >
                  {isFav ? "⭐" : "☆"}
                </button>
              </td>

              {/* 순번 */}
              <td>{idx + 1}</td>

              {/* 종목명 */}
              <td>
                <div className="name">
                  {s.name}
                  <span className="code">{s.code}</span>
                </div>
              </td>

              {/* 현재가 */}
              <td className={s.change >= 0 ? "up" : "down"}>
                {s.price.toLocaleString()} 원
              </td>

              {/* 등락률 */}
              <td className={s.change >= 0 ? "up" : "down"}>
                {s.percent}%
              </td>

              {category === "volume" && (
                <td>{s.volume.toLocaleString()} 주</td>
              )}

              {category === "amount" && (
                <td>{formatToEok(s.amount)} 억</td>
              )}

            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
