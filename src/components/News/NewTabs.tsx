import { useState } from "react";
import TopNews from "../News/TopNws";
import MyStocksNews from "../News/MyStocksNews";
import "../../assets/News/NewsTabs.css";

export default function NewsTabs() {
  const [tab, setTab] = useState<"top" | "my">("top");

  return (
    <div className="news-container">
      <div className="news-top-tabs">
        <button
          className={`news-tab ${tab === "top" ? "active" : ""}`}
          onClick={() => setTab("top")}
        >
          실시간 주요 뉴스
        </button>
        <button
          className={`news-tab ${tab === "my" ? "active" : ""}`}
          onClick={() => setTab("my")}
        >
          보유 종목 뉴스
        </button>
      </div>

      <div className="news-content">
        {tab === "top" ? <TopNews /> : <MyStocksNews />}
      </div>
    </div>
  );
}
