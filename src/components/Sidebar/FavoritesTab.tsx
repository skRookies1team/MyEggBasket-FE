import { useFavoriteStore } from "../../store/favoriteStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FavoritesTab() {
  const favorites = useFavoriteStore((s) => s.favorites);
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className=" h-[90%] rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Title */}
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-indigo-300">
        관심 종목
      </h3>

      {/* Empty */}
      {favorites.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          등록된 관심 종목이 없습니다.
        </p>
      ) : (
        <ul className="h-full space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2e2e44] scrollbar-track-transparent">
          {favorites.map((item) => (
            <li
              key={item.interestId}
              onClick={() => navigate(`/stock/${item.stockCode}`)}
              className="group flex cursor-pointer items-center justify-between rounded-xl bg-[#1f1f2e] px-3 py-2 transition-all
                         hover:bg-[#26263a] hover:shadow-md"
            >
              {/* Stock Info */}
              <div className="flex flex-col">
                {/* 종목명 */}
                <span className="text-sm font-medium text-gray-100 group-hover:text-white">
                  {item.name}
                </span>

                {/* 종목코드 */}
                <span className="text-xs text-gray-400">
                  {item.stockCode}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.stockCode);
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-gray-400
                           transition-colors hover:bg-red-500/20 hover:text-red-400"
                title="관심 종목 해제"
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
