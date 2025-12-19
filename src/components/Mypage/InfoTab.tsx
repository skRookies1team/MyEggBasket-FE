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

  // InfoTab 로드 시 user 없으면 fetch
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const handleDelete = async () => {
    if (!user?.id) {
      alert("사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
      return;
    }

    const ok = window.confirm(
      "정말로 회원 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
    );
    if (!ok) return;

    try {
      await deleteAccount();
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <UserInfoSection />

      {/* API Key */}
      <ApiKeySection />

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5">
        <h3 className="mb-2 text-sm font-semibold text-red-400">
          ⚠️ Danger Zone
        </h3>
        <p className="mb-4 text-xs text-gray-400">
          회원 탈퇴 시 계정 정보, API Key, 거래 내역은 복구할 수 없습니다.
        </p>

        <button
          onClick={handleDelete}
          className="w-full rounded-lg bg-red-500/20 py-2 text-sm font-semibold
                     text-red-400 transition hover:bg-red-500/30"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
