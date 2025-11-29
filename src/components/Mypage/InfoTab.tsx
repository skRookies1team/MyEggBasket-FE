// src/components/mypage/InfoTab.tsx
import UserInfoSection from "../Mypage/UserInfoSection";
import ApiKeySection from "../Mypage/ApiKeySection";
import api from "../../store/axiosStore";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function InfoTab() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!user?.id) return;
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      logout();
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <UserInfoSection />
      <ApiKeySection />

      <button className="mypage-delete-btn" onClick={handleDelete}>
        회원 탈퇴
      </button>
    </>
  );
}
