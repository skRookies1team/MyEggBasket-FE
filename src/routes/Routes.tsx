import { Routes, Route, useNavigate } from "react-router-dom"; // useNavigate 추가
import Nav from "../components/Nav";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import StockDetailPage from "../pages/StockDetailPage.tsx";
import { PortfolioPage } from "../pages/PortfolioPage.tsx";

export default function Router() {
    const navigate = useNavigate(); // 네비게이션 함수 생성

    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* onNavigateToHistory에 navigate 함수 전달 */}
                <Route
                    path="/portfolio"
                    element={<PortfolioPage onNavigateToHistory={() => navigate('/history')} />}
                />

                {/* 히스토리 페이지 라우트 추가 */}

                <Route path="/stock/:code" element={<StockDetailPage />} />

                {/* 404 처리 */}
                <Route path="*" element={<div style={{ padding: 24 }}>페이지를 찾을 수 없습니다.</div>} />
            </Routes>
        </>
    );
}