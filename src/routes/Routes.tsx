import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage";
import Nav from "../components/Nav";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

export default function Router() {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="*" element={<div style={{ padding: 24 }}>No match</div>} />
            </Routes>
        </>
    );
}
