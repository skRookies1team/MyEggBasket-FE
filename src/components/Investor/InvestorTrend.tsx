import { useState } from "react";
import InvestorSection from "../Investor/InvestorSection";
import "../../assets/Investor/InvestorTrend.css";

export default function InvestorTrend() {
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  // 샘플 데이터 구조
  const dummyData = {
    buy: {
      foreign: [
        { name: "삼성전자", price: 78500, rate: 2.14, amount: 201_000_000_000 },
        { name: "SK하이닉스", price: 121000, rate: 1.02, amount: 123_000_000_000 },
        { name: "NAVER", price: 205000, rate: -0.22, amount: 87_000_000_000 }
      ],
      institute: [
        { name: "현대차", price: 189000, rate: 0.61, amount: 92_000_000_000 },
        { name: "셀트리온", price: 154000, rate: -0.41, amount: 71_000_000_000 }
      ],
      retail: [
        { name: "LG에너지솔루션", price: 388000, rate: -0.11, amount: 55_000_000_000 }
      ]
    },
    sell: {
      foreign: [
        { name: "카카오", price: 51000, rate: -0.52, amount: 98_000_000_000 },
        { name: "포스코홀딩스", price: 512000, rate: 1.11, amount: 88_000_000_000 }
      ],
      institute: [
        { name: "한화솔루션", price: 44800, rate: -0.24, amount: 42_000_000_000 }
      ],
      retail: [
        { name: "삼성바이오로직스", price: 755000, rate: 0.84, amount: 132_000_000_000 }
      ]
    }
  };

  return (
    <div>
      {/* 상단 탭 */}
      <div className="trend-tabs">
        <button
          className={`trend-tab ${tab === "buy" ? "active" : ""}`}
          onClick={() => setTab("buy")}
        >
          순매수
        </button>
        <button
          className={`trend-tab ${tab === "sell" ? "active" : ""}`}
          onClick={() => setTab("sell")}
        >
          순매도
        </button>
      </div>

      {/* 3개 컬럼 */}
      <div className="investor-trend-container">
        <InvestorSection title="외국인" data={dummyData[tab].foreign} />
        <InvestorSection title="기관" data={dummyData[tab].institute} />
        <InvestorSection title="개인" data={dummyData[tab].retail} />
      </div>
    </div>
  );
}
