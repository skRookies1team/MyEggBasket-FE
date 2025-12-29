import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack
} from "@mui/material";

import { useAuthStore } from "../store/authStore";
import type { ModalType } from "../types/modal";
import LoginResultModal from "../components/LoginResultModal";



export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // 2. 모달 상태 관리
  const [modalStatus, setModalStatus] = useState<{
    type: ModalType;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const handleLoginChange =
    (field: keyof typeof loginData) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [field]: e.target.value });
      };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  // 3. 로그인 핸들러 수정
  const handleLogin = async () => {
    try {
      await login(loginData);

      // 성공 모달 표시
      setModalStatus({
        type: "success",
        message: "로그인에 성공했습니다! 잠시 후 메인 화면으로 이동합니다.",
      });

      // 1.5초 후 페이지 이동
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setModalStatus({
          type: "error",
          message: err.response?.data?.message ?? "로그인 정보가 일치하지 않습니다.",
        });
      } else {
        setModalStatus({
          type: "error",
          message: "서버 연결에 실패했습니다. 다시 시도해 주세요.",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: 420,
          bgcolor: "#1a1a24",
          border: "1px solid #2a2a35",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{ color: "#ffffff", fontWeight: 700, mb: 3, textAlign: "center" }}
          >
            로그인
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="이메일"
              value={loginData.email}
              onChange={handleLoginChange("email")}
              onKeyDown={handleEnter}
              fullWidth
              InputLabelProps={{ style: { color: "#ffffff" } }}
              sx={{
                input: { color: "#ffffff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#2a2a35" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />

            <TextField
              label="비밀번호"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange("password")}
              onKeyDown={handleEnter}
              fullWidth
              InputLabelProps={{ style: { color: "#ffffff" } }}
              sx={{
                input: { color: "#ffffff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#2a2a35" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleLogin}
              sx={{
                mt: 1,
                bgcolor: "#7c3aed",
                fontWeight: 600,
                "&:hover": { bgcolor: "#6d28d9" },
              }}
            >
              로그인
            </Button>

            <Button
              variant="text"
              sx={{ color: "#b5b5c5" }}
              onClick={() => navigate("/signup")}
            >
              아직 회원이 아닌가요? 가입하기
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 4. 모달 컴포넌트 배치 */}

      <LoginResultModal
        type={modalStatus.type}
        message={modalStatus.message}
        onClose={() => setModalStatus({ ...modalStatus, type: null })}
        // 로그인 성공 시 바로 이동할 수 있게 버튼 텍스트 변경
        actionLabel={modalStatus.type === 'success' ? "메인으로 이동" : "다시 시도"}
        onAction={() => {
          if (modalStatus.type === 'success') {
            navigate("/");
          }
          setModalStatus({ ...modalStatus, type: null });
        }}
      />
    </Box>
  );
}