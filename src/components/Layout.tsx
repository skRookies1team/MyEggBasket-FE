import { useState } from "react";
import { type ReactNode } from "react";

import Nav from "../components/Nav";
import Sidebar from "../pages/Sidebar";

import { useAuthStore } from "../store/authStore";
import { usePortfolioStore } from "../store/portfolioStore";

import { PriceAlertManager } from "../components/alert/PriceAlertManager";
import { AIRecommendationAlertManager } from "../components/alert/AIRebalanceAlertManager";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const portfolioId = usePortfolioStore(
    (s) => s.selectedPortfolioId
  );

  const toggleSidebar = () => {
    if (!isAuthenticated) return;
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout-wrapper">
      {/* 상단 네비 */}
      <Nav
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />

      {/* 사이드바 */}
      {isAuthenticated && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* 메인 컨텐츠 */}
      <div className={`main-content ${sidebarOpen ? "shift" : ""}`}>
        {children}
      </div>

      {/* 알림 영역 (인증 + 포트폴리오 있을 때만) */}
      {isAuthenticated && portfolioId && (
        <>
          <PriceAlertManager />
          <AIRecommendationAlertManager portfolioId={portfolioId} />
        </>
      )}
    </div>
  );
}
