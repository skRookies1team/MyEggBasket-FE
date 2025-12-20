import { useState } from "react";
import InfoTab from "../components/Mypage/InfoTab";
import HistoryTab from "../components/Mypage/HistoryTab";

type TabKey = "info" | "history";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  return (
    // 🔥 여백까지 다크 배경 적용
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {/* Title */}
        <h2 className="text-lg font-semibold tracking-wide text-indigo-300">
          마이페이지
        </h2>

        {/* Tabs */}
        <div className="flex rounded-xl bg-[#14141c] p-1">
          <TabButton
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
          >
            정보 수정
          </TabButton>

          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          >
            거래내역
          </TabButton>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          {activeTab === "info" ? <InfoTab /> : <HistoryTab />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tab Button ---------------- */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all
        ${
          active
            ? "bg-indigo-500/20 text-indigo-300 shadow-inner"
            : "text-gray-400 hover:text-gray-200"
        }`}
    >
      {children}
    </button>
  );
}
