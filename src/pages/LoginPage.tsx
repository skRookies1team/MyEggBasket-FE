import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/LoginPage.css";
import axios from "axios";
import { useAuthStore } from "../store/authStore"; 

export default function LoginPage() {
  const navigate = useNavigate();

  // Zustand login 함수 가져오기
  const login = useAuthStore((state) => state.login);

  const [showFindPassword, setShowFindPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [findPasswordData, setFindPasswordData] = useState({
    userId: "",
    email: "",
  });

  // 로그인 input 핸들러
  const handleLoginChange =
    (field: keyof typeof loginData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setLoginData({ ...loginData, [field]: e.target.value });
    };

  // 비밀번호 찾기 input 핸들러
  const handleFindPasswordChange =
    (field: keyof typeof findPasswordData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setFindPasswordData({ ...findPasswordData, [field]: e.target.value });
    };

  const handleLogin = async () => {
    try {
      console.log("로그인 요청:", loginData);

      await login({
        email: loginData.email,
        password: loginData.password,
      });

      alert("로그인 성공!");
      navigate("/");

        } catch (err: unknown) {
            console.error(err);

            if (axios.isAxiosError(err)) {
                const msg =
                    err.response?.data?.message ??
                    "로그인 중 오류가 발생했습니다.";
                alert(msg);
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }
        }
  };

  const handleFindPassword = () => {
    console.log("비밀번호 찾기 요청:", findPasswordData);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>

      {/* 이메일 */}
      <div className="input-group">
        <label>이메일</label>
        <input
          type="text"
          value={loginData.email}
          onChange={handleLoginChange("email")}
          placeholder="이메일을 입력하세요"
        />
      </div>

      {/* 비밀번호 */}
      <div className="input-group">
        <label>비밀번호</label>
        <input
          type="password"
          value={loginData.password}
          onChange={handleLoginChange("password")}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      {/* 로그인 버튼 */}
      <button className="login-btn" onClick={handleLogin}>
        로그인
      </button>

      <button className="link-btn" onClick={() => setShowFindPassword(true)}>
        비밀번호 찾기
      </button>

      <button className="link-btn" onClick={() => navigate("/signup")}>
        아직 회원이 아닌가요? 가입하기
      </button>

      {/* 비밀번호 찾기 모달 */}
      {showFindPassword && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>비밀번호 찾기</h2>

            <div className="input-group">
              <label>아이디</label>
              <input
                type="text"
                value={findPasswordData.userId}
                onChange={handleFindPasswordChange("userId")}
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div className="input-group">
              <label>이메일</label>
              <input
                type="email"
                value={findPasswordData.email}
                onChange={handleFindPasswordChange("email")}
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowFindPassword(false)}
              >
                취소
              </button>
              <button className="modal-btn ok" onClick={handleFindPassword}>
                찾기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
