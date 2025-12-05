import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecentTab() {
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
  Promise.resolve().then(() => {
    const stored = JSON.parse(localStorage.getItem("recent_stocks") || "[]");
    setRecent(stored);
  });
}, []);

  return (
    <div>
      <h3>최근 본 주식</h3>

      {recent.length === 0 ? (
        <p>최근 본 종목이 없습니다.</p>
      ) : (
        <ul>
          {recent.map((code) => (
            <li
              key={code}
              style={{ cursor: "pointer", padding: "6px 0" }}
              onClick={() => navigate(`/stock/${code}`)}
            >
              {code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
