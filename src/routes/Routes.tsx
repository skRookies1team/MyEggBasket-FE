import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage";
import Nav from "../components/Nav";

export default function Router() {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="*" element={<div style={{ padding: 24 }}>No match</div>} />
            </Routes>
        </>
    );
}
