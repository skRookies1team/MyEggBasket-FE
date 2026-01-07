import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStockInfoFromDB } from "../../api/stocksApi";

interface RecentStock {
  code: string;
  name: string;
}

function loadRecentStocks(): string[] {
  try {
    return JSON.parse(localStorage.getItem("recent_stocks") || "[]");
  } catch {
    return [];
  }
}

export default function RecentTab() {
  const navigate = useNavigate();

  /* 초기 상태는 useState에서 계산 */
  const [recent, setRecent] = useState<RecentStock[]>(() => {
    const codes = loadRecentStocks();
    return codes.map((code) => ({
      code,
      name: code, // 초기엔 코드로 표시 (즉시 렌더)
    }));
  });

  /* =====================
   * 외부 이벤트 콜백
   * ===================== */
  const sync = async () => {
    const codes = loadRecentStocks();

    const results = await Promise.all(
      codes.map(async (code) => {
        const stock = await getStockInfoFromDB(code);
        return {
          code,
          name: stock?.name ?? code,
        };
      })
    );

    setRecent(results);
  };

  /* =====================
   * effect는 "구독"만
   * ===================== */
  useEffect(() => {
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-indigo-300">
        최근 본 주식
      </h3>

      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          최근 본 종목이 없습니다.
        </p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2e2e44] scrollbar-track-transparent">
          {recent.map((stock) => (
            <li
              key={stock.code}
              onClick={() => navigate(`/stock/${stock.code}`)}
              className="cursor-pointer rounded-xl bg-[#1f1f2e] px-3 py-2 text-sm
                         text-gray-200 transition-all
                         hover:bg-[#26263a] hover:text-white hover:shadow-md"
            >
              <div className="font-medium">{stock.name}</div>
              <div className="text-[11px] text-gray-400">
                {stock.code}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
