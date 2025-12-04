import { useFavoriteStore } from "../../store/favoriteStore";
import { useEffect } from "react";
import "../../assets/Sidebar/FavoritesTab.css";

export default function FavoritesTab() {
  const favorites = useFavoriteStore((s) => s.favorites);
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

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
          {favorites.map((code) => (
            <li key={code} className="fav-item">
              <span className="fav-code">{code}</span>

              <button
                className="fav-remove-btn"
                onClick={() => toggleFavorite(code)}
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
