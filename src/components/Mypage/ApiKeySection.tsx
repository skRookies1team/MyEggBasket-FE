// src/components/mypage/ApiKeySection.tsx
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../store/axiosStore";

export default function ApiKeySection() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    appkey: user?.appkey || "",
    appsecret: user?.appsecret || "",
  });

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id) return alert("사용자 정보를 찾을 수 없습니다.");

    try {
      const payload = {
        appkey: form.appkey || null,
        appsecret: form.appsecret || null,
      };

      const res = await api.put(`/users/${user.id}`, payload);

      setUser(res.data);

      alert("API Key가 수정되었습니다.");
      setEditMode(false);

    } catch (err) {
      console.error(err);
      alert("API Key 수정 실패");
    }
  };

  const handleCancel = () => {
    setForm({
      appkey: user?.appkey || "",
      appsecret: user?.appsecret || "",
    });
    setEditMode(false);
  };

  return (
    <div className="mypage-box">
      <h3>🔑 API Key 변경</h3>

      <label>App Key</label>
      <input
        disabled={!editMode}
        value={form.appkey}
        onChange={(e) => handleChange("appkey", e.target.value)}
      />

      <label>App Secret</label>
      <input
        disabled={!editMode}
        value={form.appsecret}
        onChange={(e) => handleChange("appsecret", e.target.value)}
      />

      {!editMode ? (
        <button className="mypage-btn" onClick={() => setEditMode(true)}>
          수정하기
        </button>
      ) : (
        <div className="mypage-edit-buttons">
          <button className="mypage-btn save" onClick={handleSave}>
            저장
          </button>
          <button className="mypage-btn cancel" onClick={handleCancel}>
            취소
          </button>
        </div>
      )}
    </div>
  );
}
