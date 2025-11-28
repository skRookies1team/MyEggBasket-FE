import { useState } from "react";
import InfoTab from "../components/Mypage/InfoTab";
import HistoryTab from "../components/Mypage/HistoryTab";
import "../assets/MyPage.css";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<"info" | "history">("info");

  return (
    <div className="mypage-container">
      <h2 className="mypage-title">마이페이지</h2>

      <div className="mypage-tabs">
        <button
          className={activeTab === "info" ? "mypage-tab active" : "mypage-tab"}
          onClick={() => setActiveTab("info")}
        >
          정보 수정
        </button>

        <button
          className={
            activeTab === "history" ? "mypage-tab active" : "mypage-tab"
          }
          onClick={() => setActiveTab("history")}
        >
          거래내역
        </button>
      </div>

      {activeTab === "info" ? <InfoTab /> : <HistoryTab />}
    </div>
  );
}
