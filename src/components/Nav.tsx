import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { searchStocksFromDB} from "../api/stockApi";
import type {StockSearchResult} from "../api/stockApi"// 추가된 API import
import "../assets/Nav.css";

interface NavProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Nav: React.FC<NavProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]); // 검색 결과 상태
  const [showDropdown, setShowDropdown] = useState(false); // 드롭다운 표시 여부
  const searchRef = useRef<HTMLDivElement>(null); // 외부 클릭 감지용 Ref

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  // 검색어 입력 시 디바운스 처리하여 API 호출
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.trim().length > 0) {
        const results = await searchStocksFromDB(q);
        setSearchResults(results);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms 딜레이

    return () => clearTimeout(timer);
  }, [q]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStockClick = (code: string) => {
    navigate(`/stock/${code}`);
    setQ("");
    setShowDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 엔터키 입력 시 첫 번째 결과로 이동하거나 검색 페이지로 이동 (여기서는 첫번째 결과 이동으로 구현)
  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchResults.length > 0) {
      handleStockClick(searchResults[0].stockCode);
    }
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

        <div className="nav__center" ref={searchRef}>
          <form onSubmit={submitSearch} className="nav__search-form" style={{ position: 'relative' }}>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => q.trim().length > 0 && setShowDropdown(true)}
                placeholder="종목명, 종목코드 검색"
                className="nav__search-input"
            />
            {/* 검색 결과 자동완성 드롭다운 */}
            {showDropdown && searchResults.length > 0 && (
                <ul className="search-dropdown">
                  {searchResults.map((stock) => (
                      <li
                          key={stock.stockCode}
                          onClick={() => handleStockClick(stock.stockCode)}
                          className="search-item"
                      >
                        <span className="stock-name">{stock.name}</span>
                        <span className="stock-code">{stock.stockCode}</span>
                        <span className="market-type">{stock.marketType}</span>
                      </li>
                  ))}
                </ul>
            )}
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