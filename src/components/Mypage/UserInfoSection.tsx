// src/components/mypage/UserInfoSection.tsx
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../store/axiosStore";

export default function UserInfoSection() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    username: user?.username || "",
    password: "",
    newPassword: "",
  });

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id) return alert("사용자 정보를 찾을 수 없습니다.");

    try {
      const payload = {
        username: form.username || null,
        password: form.password || null,
        newPassword: form.newPassword || null,
      };

      const res = await api.put(`/users/${user.id}`, payload);

      // 서버에서 UserResponse 반환
      setUser(res.data);

      alert("회원 정보가 수정되었습니다.");
      setEditMode(false);

      // 비밀번호 입력 초기화
      setForm((prev) => ({
        ...prev,
        password: "",
        newPassword: "",
      }));

    } catch (err) {
      console.error(err);
      alert("회원 정보 수정 실패");
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || "",
      password: "",
      newPassword: "",
    });
    setEditMode(false);
  };

  return (
    <div className="mypage-box">
      <h3>👤 회원 정보 / 비밀번호 변경</h3>

      <label>이메일(수정 불가)</label>
      <input value={user?.email ?? ""} disabled />

      <label>사용자명</label>
      <input
        disabled={!editMode}
        value={form.username}
        onChange={(e) => handleChange("username", e.target.value)}
      />

      <label>현재 비밀번호</label>
      <input
        disabled={!editMode}
        type="password"
        value={form.password}
        onChange={(e) => handleChange("password", e.target.value)}
      />

      <label>새 비밀번호</label>
      <input
        disabled={!editMode}
        type="password"
        value={form.newPassword}
        onChange={(e) => handleChange("newPassword", e.target.value)}
      />

      {!editMode ? (
        <button className="mypage-btn" onClick={() => setEditMode(true)}>
          수정하기
        </button>
      ) : (
        <div className="mypage-edit-buttons">
          <button className="mypage-btn save" onClick={handleSave}>
            저장하기
          </button>
          <button className="mypage-btn cancel" onClick={handleCancel}>
            취소
          </button>
        </div>
      )}
    </div>
  );
}
