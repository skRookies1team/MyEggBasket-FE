import { useState, useEffect } from "react";
import { type ReactNode } from "react";

import Nav from "../components/Nav";
import Sidebar from "../pages/Sidebar";

import { useAuthStore } from "../store/authStore";
import { usePortfolioStore } from "../store/portfolioStore";

import { PriceAlertManager } from "./alert/PriceAlertManager";
import { AIRebalanceAlertManager } from "./alert/AIRebalanceAlertManager";
import { GlobalStockSubscriptionManager } from "./GlobalStockSubscriptionManager";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const portfolioId = usePortfolioStore((s) => s.selectedPortfolioId);

  console.log("Layout 렌더링 상태:", { isAuthenticated, portfolioId });

  // [추가] 새로고침 시 유저 정보 복구 (Hydration)
  useEffect(() => {
    // 토큰은 있는데 유저 정보가 없으면 로드 시도
    if (isAuthenticated && !useAuthStore.getState().user) {
      console.log("Layout: 유저 정보 복구 시도 (Hydration)");
      useAuthStore.getState().fetchUser();
    }
  }, [isAuthenticated]);

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
      {isAuthenticated && (
        <>
          <PriceAlertManager />
          <AIRebalanceAlertManager />
          <GlobalStockSubscriptionManager />
        </>
      )}
    </div>
  );
}
