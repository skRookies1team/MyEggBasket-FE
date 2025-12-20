import { useState } from "react";
import FavoritesTab from "../components/Sidebar/FavoritesTab";
import MyAssetsTab from "../components/Sidebar/MyAssetsTab";
import RecentTab from "../components/Sidebar/RecentTab";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "assets" | "favorites" | "recent";

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("assets");

  const renderTab = () => {
    switch (activeTab) {
      case "assets":
        return <MyAssetsTab />;
      case "favorites":
        return <FavoritesTab />;
      case "recent":
        return <RecentTab />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay (Nav 아래부터) */}
      <div
        onClick={onClose}
        className={`fixed inset-x-0 bottom-0 top-16 z-40
          bg-black/50 transition-opacity
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-16 z-50
          h-[calc(100vh-64px)] w-[320px] transform
          bg-[#0a0a0f]
          shadow-[-8px_0_24px_rgba(0,0,0,0.6)]
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Tabs */}
        <div className="flex border-b border-[#1f1f2e]">
          <TabButton
            active={activeTab === "assets"}
            onClick={() => setActiveTab("assets")}
          >
            내 자산
          </TabButton>

          <TabButton
            active={activeTab === "favorites"}
            onClick={() => setActiveTab("favorites")}
          >
            관심 종목
          </TabButton>

          <TabButton
            active={activeTab === "recent"}
            onClick={() => setActiveTab("recent")}
          >
            최근 본
          </TabButton>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-48px)] overflow-y-auto p-3">
          {renderTab()}
        </div>
      </aside>
    </>
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
      className={`flex-1 py-3 text-sm font-medium transition-colors
        ${
          active
            ? "border-b-2 border-indigo-400 text-indigo-300"
            : "text-gray-400 hover:text-gray-200"
        }`}
    >
      {children}
    </button>
  );
}
