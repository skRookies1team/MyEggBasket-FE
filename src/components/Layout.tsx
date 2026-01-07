import { useState } from "react";
import Nav from "../components/Nav";
import Sidebar from "../pages/Sidebar";
import { useAuthStore } from "../store/authStore";
import { type ReactNode } from "react";
import { PriceAlertManager } from "../components/alert/PriceAlertManager";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const toggleSidebar = () => {
    if (!isAuthenticated) return;
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout-wrapper">
      <Nav
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />

      {isAuthenticated && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className={`main-content ${sidebarOpen ? "shift" : ""}`}>
        {children}
      </div>

        <PriceAlertManager />
    </div>
  );
}
