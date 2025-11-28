import { Routes, Route } from "react-router-dom";
import Nav from "../components/Nav";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import StockDetailPage from "../pages/StockDetailPage.tsx";

export default function Router() {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* 동적 라우팅 설정: :code 파라미터를 사용 */}
                <Route path="/stock/:code" element={<StockDetailPage />} />

                {/* 404 처리 */}
                <Route path="*" element={<div style={{ padding: 24 }}>페이지를 찾을 수 없습니다.</div>} />
            </Routes>
        </>
    );
}