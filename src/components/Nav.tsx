import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Nav.css';

interface NavProps {
  onToggleSidebar?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Nav: React.FC<NavProps> = ({
  onToggleSidebar,
  isLoggedIn = false,
  onLogout
}) => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  return (
    <nav className="nav">
      <div className="nav__left">
        <button onClick={() => onToggleSidebar?.()} aria-label="toggle" className="nav__toggle">☰</button>
        <button onClick={() => navigate('/')} className="nav__brand">MyEggBasket</button>
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
        <button onClick={() => navigate('/portfolio')} className="nav__link">포트폴리오</button>
        <button onClick={() => navigate('/history')} className="nav__link">히스토리</button>

        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate('/mypage')}
              className="nav__link"
            >
              마이페이지
            </button>
            <button onClick={() => onLogout?.()} className="nav__link">로그아웃</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="nav__login">로그인</button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
