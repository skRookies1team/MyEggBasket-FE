import type { TabType } from "../../types/stock.ts";

interface StockTabNavProps {
  activeTab: TabType;
  onTabChange: (t: TabType) => void;
}

export function StockTabNav({
  activeTab,
  onTabChange,
}: StockTabNavProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "chart", label: "차트" },
    { id: "news", label: "뉴스" },
    { id: "info", label: "기업정보" },
    { id: "report", label: "리포트" },
  ];

  return (
    <div className="border-b border-[#232332] bg-gradient-to-b from-[#1a1a24] to-[#14141c]">
      <div className="mx-auto flex max-w-[1600px] overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-6 py-4 text-sm font-medium
                whitespace-nowrap transition
                ${
                  active
                    ? "text-indigo-300"
                    : "text-gray-400 hover:text-gray-200"
                }
              `}
            >
              {tab.label}

              {/* Active underline */}
              {active && (
                <span
                  className="
                    absolute inset-x-3 bottom-0 h-0.5
                    rounded-full bg-indigo-400
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
