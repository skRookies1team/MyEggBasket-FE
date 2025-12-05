import { useFavoriteStore } from "../../store/favoriteStore";
import { useNavigate } from "react-router-dom";   
import type { StockItem } from "../../types/stock";
import "../../assets/LiveStock/LiveStockTable.css";

interface Props {
  stocks: StockItem[];
}

export default function LiveStockTable({ stocks }: Props) {
  const { favorites, toggleFavorite } = useFavoriteStore();
  const navigate = useNavigate();                 

  return (
    <table className="live-stock-table">
      <thead>
        <tr>
          <th></th>
          <th>종목명</th>
          <th>현재가</th>
          <th>등락률</th>
          <th>거래량</th>
        </tr>
      </thead>

      <tbody>
        {stocks.map((s) => {
          const isFav = favorites.includes(s.code);

          return (
            <tr
              key={s.code}
              className="clickable-row"
              onClick={() => navigate(`/stock/${s.code}`)}    
            >
              {/* 즐겨찾기 버튼 */}
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

              {/* 종목명 + 코드 */}
              <td>
                <div className="name">
                  {s.name}
                  <span className="code">{s.code}</span>
                </div>
              </td>

              {/* 현재가 */}
              <td className={s.change >= 0 ? "up" : "down"}>
                {s.price.toLocaleString()}
              </td>

              {/* 등락률 */}
              <td className={s.change >= 0 ? "up" : "down"}>
                {s.percent}%
              </td>

              {/* 거래량 */}
              <td>{s.volume.toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
