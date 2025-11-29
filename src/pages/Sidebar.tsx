import "../assets/Sidebar.css";
import { useState } from "react";
import FavoritesTab from "../components/Sidebar/FavoritesTab";
import MyAssetsTab from "../components/Sidebar/MyAssetsTab";
import RecentTab from "../components/Sidebar/RecentTab";


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "favorites" | "recent">("assets");

  const renderTab = () => {
    if (activeTab === "assets") return <MyAssetsTab />;
    if (activeTab === "favorites") return <FavoritesTab />;
    if (activeTab === "recent") return <RecentTab />;
    return null;
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-section">
          
          {/* 버튼 클릭 시 탭 전환 */}
          <button
            className={`sidebar-item ${activeTab === "assets" ? "active" : ""}`}
            onClick={() => setActiveTab("assets")}
          >
            내 자산
          </button>

          <button
            className={`sidebar-item ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            관심 종목
          </button>

          <button
            className={`sidebar-item ${activeTab === "recent" ? "active" : ""}`}
            onClick={() => setActiveTab("recent")}
          >
            최근 본 주식
          </button>
        </div>

        {/* 탭 내용 표시 영역 */}
        <div className="sidebar-content">
          {renderTab()}
        </div>
      </aside>
    </>
  );
}
