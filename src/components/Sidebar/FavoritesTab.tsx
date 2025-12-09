import { useFavoriteStore } from "../../store/favoriteStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Sidebar/FavoritesTab.css";

export default function FavoritesTab() {
  const favorites = useFavoriteStore((s) => s.favorites);
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="fav-container">
      <h3 className="fav-title">관심 종목</h3>

      {favorites.length === 0 ? (
        <p className="fav-empty">등록된 관심 종목이 없습니다.</p>
      ) : (
        <ul className="fav-list">
          {favorites.map((item) => (
            <li
              key={item.interestId}
              className="fav-item"
              onClick={() => navigate(`/stock/${item.stockCode}`)}
            >
              <div className="fav-info">
                <span className="fav-code">{item.stockCode}</span>
                <span className="fav-name">{item.name}</span>
              </div>

              <button
                className="fav-remove-btn"
                onClick={(e) => {
                  e.stopPropagation(); // 상세 페이지 이동 막기
                  toggleFavorite(item.stockCode);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
