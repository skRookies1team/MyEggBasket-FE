import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/LoginPage.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    appKey: "",
    appSecret: "",
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSignup = () => {
    console.log("회원가입 요청:", formData);

    navigate("/login");
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
          value={formData.name}
          onChange={handleChange("name")}
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
          value={formData.passwordConfirm}
          onChange={handleChange("passwordConfirm")}
          placeholder="비밀번호를 다시 입력하세요"
        />
      </div>

      <div className="input-group">
        <label>APP KEY</label>
        <input
          type="text"
          value={formData.appKey}
          onChange={handleChange("appKey")}
          placeholder="한국투자증권 APP_KEY"
        />
      </div>

      <div className="input-group">
        <label>APP SECRET</label>
        <input
          type="password"
          value={formData.appSecret}
          onChange={handleChange("appSecret")}
          placeholder="한국투자증권 APP_SECRET"
        />
      </div>

      <button className="login-btn" onClick={handleSignup}>
        회원가입
      </button>

      <button className="link-btn" onClick={() => navigate(-1)}>
        뒤로가기
      </button>

      <button className="link-btn" onClick={() => navigate("/login")}>
        이미 계정이 있으신가요? 로그인하기
      </button>
    </div>
  );
}
