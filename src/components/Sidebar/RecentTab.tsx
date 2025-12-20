import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecentTab() {
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.resolve().then(() => {
      const stored = JSON.parse(
        localStorage.getItem("recent_stocks") || "[]"
      );
      setRecent(stored);
    });
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Title */}
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-indigo-300">
        최근 본 주식
      </h3>

      {/* Empty */}
      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          최근 본 종목이 없습니다.
        </p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2e2e44] scrollbar-track-transparent">
          {recent.map((code) => (
            <li
              key={code}
              onClick={() => navigate(`/stock/${code}`)}
              className="cursor-pointer rounded-xl bg-[#1f1f2e] px-3 py-2 text-sm
                         text-gray-200 transition-all
                         hover:bg-[#26263a] hover:text-white hover:shadow-md"
            >
              {code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
