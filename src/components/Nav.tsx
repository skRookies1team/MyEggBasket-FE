import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Box,
  Button,
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useAuthStore } from "../store/authStore";
import { searchStocks } from "../api/stocksApi";
import type { StockSearchResult } from "../api/stocksApi";

interface NavProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Nav: React.FC<NavProps> = ({
                                   onToggleSidebar,
                                   isSidebarOpen,
                                 }) => {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  /* ---------------- 검색 디바운스 ---------------- */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.trim()) {
        const results = await searchStocks(q);
        setSearchResults(results);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  /* ---------------- 외부 클릭 ---------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
          searchRef.current &&
          !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchResults.length > 0) {
      handleStockClick(searchResults[0].stockCode);
    }
  };

  return (
      <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "#0a0a0f",
            borderBottom: "1px solid #2a2a35",
            zIndex: 1200,
          }}
      >
        {/* [수정] px 값을 추가하여 양옆 여백 확보
        xs(모바일): 2 (16px), md(태블릿/PC): 6 (48px)
      */}
        <Toolbar sx={{ gap: 30, px: { xs: 2, md: 20 } }}>
          {/* 좌측: 브랜드 + 메뉴 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
                onClick={() => navigate("/")}
                sx={{
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                }}
            >
              MyEggBasket
            </Button>

            {["포트폴리오", "내 자산", "히스토리"].map((label) => (
                <Button
                    key={label}
                    onClick={() =>
                        navigate(
                            label === "포트폴리오"
                                ? "/portfolio"
                                : label === "내 자산"
                                    ? "/myassets"
                                    : "/history"
                        )
                    }
                    sx={{
                      color: "#b5b5c5",
                      fontSize: "0.9rem",
                      "&:hover": { color: "#ffffff" },
                    }}
                >
                  {label}
                </Button>
            ))}
          </Box>

          {/* 중앙: 검색 */}
          <Box
              ref={searchRef}
              sx={{
                flex: 1,
                maxWidth: 420,
                position: "relative",
              }}
          >
            <form onSubmit={submitSearch}>
              <TextField
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => q && setShowDropdown(true)}
                  placeholder="종목명 · 종목코드 검색"
                  size="small"
                  fullWidth
                  sx={{
                    input: { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#1a1a24",
                      "& fieldset": { borderColor: "#2a2a35" },
                      "&:hover fieldset": { borderColor: "#7c3aed" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7c3aed",
                      },
                    },
                  }}
              />
            </form>

            {/* 검색 자동완성 */}
            {showDropdown && searchResults.length > 0 && (
                <Paper
                    sx={{
                      position: "absolute",
                      top: "44px",
                      width: "100%",
                      bgcolor: "#1a1a24",
                      border: "1px solid #2a2a35",
                      zIndex: 1300,
                    }}
                >
                  <List dense>
                    {searchResults.map((s) => (
                        <ListItemButton
                            key={s.stockCode}
                            onClick={() => handleStockClick(s.stockCode)}
                        >
                          <ListItemText
                              primary={
                                <Typography sx={{ color: "#ffffff" }}>
                                  {s.name}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                    sx={{
                                      color: "#b5b5c5",
                                      fontSize: "0.75rem",
                                    }}
                                >
                                  {s.stockCode} · {s.marketType}
                                </Typography>
                              }
                          />
                        </ListItemButton>
                    ))}
                  </List>
                </Paper>
            )}
          </Box>

          {/* 우측 끝: 로그인 / 마이페이지 / 로그아웃 / 사이드바 */}
          <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: "auto",
              }}
          >
            {isAuthenticated ? (
                <>
                  <Button
                      sx={{ color: "#b5b5c5" }}
                      onClick={() => navigate("/mypage")}
                  >
                    마이페이지
                  </Button>

                  <Button
                      sx={{ color: "#b5b5c5" }}
                      onClick={handleLogout}
                  >
                    로그아웃
                  </Button>

                  <IconButton
                      onClick={() => onToggleSidebar?.()}
                      sx={{ color: "#ffffff" }}
                  >
                    {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                  </IconButton>
                </>
            ) : (
                <Button
                    sx={{
                      color: "#ffffff",
                      border: "1px solid #7c3aed",
                      "&:hover": { bgcolor: "#7c3aed" },
                    }}
                    onClick={() => navigate("/login")}
                >
                  로그인
                </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
  );
};

export default Nav;