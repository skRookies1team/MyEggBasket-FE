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

      setUser(res.data);

      alert("회원 정보가 수정되었습니다.");
      setEditMode(false);

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
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Title */}
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-indigo-300">
        👤 회원 정보 / 비밀번호 변경
      </h3>

      {/* Email */}
      <Field label="이메일 (수정 불가)">
        <input
          value={user?.email ?? ""}
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-[#0f0f17] px-3 py-2 text-sm text-gray-400"
        />
      </Field>

      {/* Username */}
      <Field label="사용자명">
        <input
          disabled={!editMode}
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className={inputClass(editMode)}
        />
      </Field>

      {/* Current Password */}
      <Field label="현재 비밀번호">
        <input
          disabled={!editMode}
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className={inputClass(editMode)}
        />
      </Field>

      {/* New Password */}
      <Field label="새 비밀번호">
        <input
          disabled={!editMode}
          type="password"
          value={form.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          className={inputClass(editMode)}
        />
      </Field>

      {/* Buttons */}
      {!editMode ? (
        <button
          onClick={() => setEditMode(true)}
          className="mt-4 w-full rounded-lg bg-indigo-500/20 py-2 text-sm font-medium
                     text-indigo-300 transition hover:bg-indigo-500/30"
        >
          수정하기
        </button>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-indigo-500/30 py-2 text-sm font-semibold
                       text-indigo-200 transition hover:bg-indigo-500/40"
          >
            저장하기
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg bg-[#26263a] py-2 text-sm text-gray-300
                       transition hover:bg-[#2e2e44]"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Small UI Helpers ---------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function inputClass(enabled: boolean) {
  return `w-full rounded-lg px-3 py-2 text-sm outline-none transition
    ${
      enabled
        ? "bg-[#1f1f2e] text-gray-100 focus:ring-2 focus:ring-indigo-500/40"
        : "cursor-not-allowed bg-[#0f0f17] text-gray-500"
    }`;
}
