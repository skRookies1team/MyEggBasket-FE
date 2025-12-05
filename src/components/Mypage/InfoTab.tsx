// src/components/mypage/InfoTab.tsx
import { useEffect } from "react";
import UserInfoSection from "../Mypage/UserInfoSection";
import ApiKeySection from "../Mypage/ApiKeySection";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function InfoTab() {
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore.getState().fetchUser;
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const navigate = useNavigate();

  // 🔥 InfoTab 로드 시 user가 없으면 자동으로 불러오도록 수정
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const handleDelete = async () => {
    // ❗ user 값이 없을 때 아무 반응 없던 문제 해결
    if (!user?.id) {
      alert("사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
      return;
    }

    const ok = window.confirm(
      "정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!ok) return;

    try {
      await deleteAccount(); // 전역 authStore에서 처리
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
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
