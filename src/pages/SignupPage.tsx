import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/LoginPage.css";
import axios from "axios";
import { useAuthStore } from "../store/auth";  

export default function SignupPage() {
  const navigate = useNavigate();

  // ⭐ Zustand에서 signup 함수 가져오기
  const signup = useAuthStore((state) => state.signup);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    appkey: "",
    appsecret: "",
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      console.log("회원가입 요청:", formData);

      // ⭐ Zustand signup API 호출
      await signup({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        username: formData.username,
        appkey: formData.appkey,
        appsecret: formData.appsecret,
      });

      alert("회원가입 완료!");
      navigate("/login");

    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ??
          "회원가입 중 오류가 발생했습니다.";

        alert(msg);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">회원가입</h2>

      <div className="input-group">
        <label>이메일</label>
        <input
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div className="input-group">
        <label>이름</label>
        <input
          type="text"
          value={formData.username}
          onChange={handleChange("username")}
          placeholder="이름을 입력하세요"
        />
      </div>

      <div className="input-group">
        <label>비밀번호</label>
        <input
          type="password"
          value={formData.password}
          onChange={handleChange("password")}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div className="input-group">
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="비밀번호를 다시 입력하세요"
        />
      </div>

      <div className="input-group">
        <label>APP KEY</label>
        <input
          type="text"
          value={formData.appkey}
          onChange={handleChange("appkey")}
          placeholder="한국투자증권 APP_KEY"
        />
      </div>

      <div className="input-group">
        <label>APP SECRET</label>
        <input
          type="password"
          value={formData.appsecret}
          onChange={handleChange("appsecret")}
          placeholder="한국투자증권 APP_SECRET"
        />
      </div>

      <button className="login-btn" onClick={handleSignup}>
        회원가입
      </button>

      <button className="link-btn" onClick={() => navigate("/login")}>
        이미 계정이 있으신가요? 로그인하기
      </button>
    </div>
  );
}
