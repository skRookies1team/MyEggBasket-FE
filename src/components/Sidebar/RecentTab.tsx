import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface StockJsonItem {
  code: string;
  name: string;
}

interface RecentStock {
  code: string;
  name: string;
}

/* =====================
 * localStorage → state
 * ===================== */
function readRecentCodes(): string[] {
  try {
    return JSON.parse(localStorage.getItem("recent_stocks") || "[]");
  } catch {
    return [];
  }
}

export default function RecentTab() {
  const navigate = useNavigate();

  /* 최근 본 종목 코드 */
  const [recentCodes, setRecentCodes] = useState<string[]>(() =>
    readRecentCodes()
  );

  /* 종목 코드 → 이름 Map */
  const [stockNameMap, setStockNameMap] = useState<Map<string, string>>(
    () => new Map()
  );

  /* =====================
   * stocks.json 로드 (캐시 차단)
   * ===================== */
  useEffect(() => {
    fetch("data/stocks.json", { cache: "no-store" }) 
      .then((res) => {
        if (!res.ok) {
          throw new Error(`stocks.json load failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data: StockJsonItem[]) => {

        const map = new Map<string, string>();
        data.forEach((item) => {
          map.set(item.code, item.name);
        });

        setStockNameMap(map);
      })
      .catch((err) => {
        console.error("stocks.json 로드 실패", err);
      });
  }, []);

  /* =====================
   * focus / 탭 변경 시
   * localStorage → state
   * ===================== */
  useEffect(() => {
    const syncCodes = () => {
      setRecentCodes(readRecentCodes());
    };

    window.addEventListener("focus", syncCodes);
    document.addEventListener("visibilitychange", syncCodes);

    return () => {
      window.removeEventListener("focus", syncCodes);
      document.removeEventListener("visibilitychange", syncCodes);
    };
  }, []);

  /* =====================
   * 파생 데이터
   * ===================== */
  const recent: RecentStock[] = useMemo(() => {
    return recentCodes.map((code) => ({
      code,
      name: stockNameMap.get(code) ?? code,
    }));
  }, [recentCodes, stockNameMap]);

  return (
    <div className="h-[90%] rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-indigo-300">
        최근 본 주식
      </h3>

      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          최근 본 종목이 없습니다.
        </p>
      ) : (
        <ul className="h-full space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2e2e44] scrollbar-track-transparent">
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
