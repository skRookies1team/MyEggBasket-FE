// src/routes/Router.tsx
import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import StockDetailPage from "../pages/StockDetailPage";
import {PortfolioPage} from "../pages/PortfolioPage.tsx";
import MyPage from "../pages/MyPage";
import PrivateRoute from "../routes/PrivateRoute";
import Layout from "../components/Layout.tsx";
import HistoryPage from "../pages/HistoryPage.tsx";
import MyAssetPage from "../pages/MyAssetPage.tsx";

export default function Router() {


  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<PrivateRoute />}>
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/stock/:stockCode" element={<StockDetailPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/myassets" element={<MyAssetPage />} />
                <Route
                  path="*"
                  element={<div style={{ padding: 24 }}>No match</div>}
                />
              </Routes>
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
}
