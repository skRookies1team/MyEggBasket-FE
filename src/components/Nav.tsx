import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "../assets/Nav.css";

interface NavProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;  
}

const Nav: React.FC<NavProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setQ("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="nav__left">
        <button onClick={() => navigate("/")} className="nav__brand">
          MyEggBasket
        </button>
        <button onClick={() => navigate("/portfolio")} className="nav__link">
          포트폴리오
        </button>
        <button onClick={() => navigate("/history")} className="nav__link">
          히스토리
        </button>
      </div>

      <div className="nav__center">
        <form onSubmit={submitSearch} className="nav__search-form">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="종목명, 종목코드 검색"
            className="nav__search-input"
          />
        </form>
      </div>

      <div className="nav__right">
        {isAuthenticated ? (
          <>
            <button className="nav__link" onClick={() => navigate("/mypage")}>
              마이페이지
            </button>
            <button className="nav__link" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button className="nav__login" onClick={() => navigate("/login")}>
            로그인
          </button>
        )}

        {isAuthenticated && (
          <button
            className="nav__toggle"
            onClick={() => onToggleSidebar?.()}
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
