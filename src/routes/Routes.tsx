// src/routes/Router.tsx
import { Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import StockDetailPage from "../pages/StockDetailPage";
import {PortfolioPage} from "../pages/PortfolioPage.tsx";
import MyPage from "../pages/MyPage";
import PrivateRoute from "../routes/PrivateRoute";
import Layout from "../components/Layout.tsx";

export default function Router() {
  const navigate = useNavigate(); // 네비게이션 함수 생성


  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route element={<PrivateRoute />}>
          <Route
                    path="/portfolio"
                    element={<PortfolioPage onNavigateToHistory={() => navigate('/history')} />}
                />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/stock/:code" element={<StockDetailPage />} />
          <Route
            path="*"
            element={<div style={{ padding: 24 }}>No match</div>}
          />
        </Route>
      </Routes>
    </Layout>
  );
}
