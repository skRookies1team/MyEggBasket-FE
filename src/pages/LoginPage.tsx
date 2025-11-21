import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Modal.css";
import "../assets/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [showFindPassword, setShowFindPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    userId: "",
    password: "",
  });

  const [findPasswordData, setFindPasswordData] = useState({
    userId: "",
    email: "",
  });

  // 로그인 입력 변경
  const handleLoginChange =
    (field: keyof typeof loginData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setLoginData({ ...loginData, [field]: e.target.value });
    };

  // 비밀번호 찾기 입력 변경
  const handleFindPasswordChange =
    (field: keyof typeof findPasswordData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setFindPasswordData({ ...findPasswordData, [field]: e.target.value });
    };

  const handleLogin = () => {
    console.log("로그인 요청:", loginData);
    // 로그인 API 호출 추가 가능
  };

  const handleFindPassword = () => {
    console.log("비밀번호 찾기 요청:", findPasswordData);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>

      {/* 아이디 */}
      <div className="input-group">
        <label>아이디</label>
        <input
          type="text"
          value={loginData.userId}
          onChange={handleLoginChange("userId")}
          placeholder="아이디를 입력하세요"
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

      {/* 비밀번호 찾기 */}
      <button
        className="link-btn"
        onClick={() => setShowFindPassword(true)}
      >
        비밀번호 찾기
      </button>

      {/* 회원가입 이동 */}
      <button
        className="link-btn"
        onClick={() => navigate("/signup")}
      >
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
              <button
                className="modal-btn ok"
                onClick={handleFindPassword}
              >
                찾기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
