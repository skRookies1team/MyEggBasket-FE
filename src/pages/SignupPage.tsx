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
  Stack,
} from "@mui/material";

import { useAuthStore } from "../store/authStore";
import type { ModalType } from "../types/modal";
import LoginResultModal from "../components/LoginResultModal";


export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    appkey: "",
    appsecret: "",
    account: "",
  });

  // 모달 상태 관리
  const [modalStatus, setModalStatus] = useState<{
    type: ModalType;
    message: string;
  }>({
    type: null,
    message: "",
  });

  /* ---------------- handlers ---------------- */
  const handleChange =
    (field: keyof typeof formData) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // 이메일 유효성 검사
    if (!validateEmail(formData.email)) {
      setModalStatus({
        type: "error",
        message: "유효한 이메일 형식이 아닙니다.\n이메일을 다시 확인해 주세요.",
      });
      return;
    }
    // 비밀번호 일치 여부 검사
    if (formData.password !== formData.confirmPassword) {
      setModalStatus({
        type: "error",
        message: "비밀번호가 일치하지 않습니다.\n다시 입력해 주세요.",
      });
      return;
    }

    // 모든 검증 통과 후 서버 전송
    try {
      await signup(formData);
      
      setModalStatus({
        type: "success",
        message: "회원가입이 완료되었습니다!\n이제 로그인을 진행해 주세요.",
      });
    } catch (err: unknown) {
      // 에러 처리 생략 (기존 코드와 동일)
      if (axios.isAxiosError(err)) {
        setModalStatus({
          type: "error",
          message: err.response?.data?.message ?? "회원가입 중 오류가 발생했습니다.",
        });
      }
    }
  };

  /* ---------------- 공통 input 스타일 ---------------- */
  const inputStyle = {
    input: { color: "#ffffff" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#2a2a35" },
      "&:hover fieldset": { borderColor: "#7c3aed" },
      "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
    },
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
          width: 460,
          bgcolor: "#1a1a24",
          border: "1px solid #2a2a35",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{ color: "#ffffff", fontWeight: 700, mb: 3, textAlign: "center" }}
          >
            회원가입
          </Typography>

          <Stack spacing={2}>
            <TextField label="이메일" value={formData.email} onChange={handleChange("email")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />
            <TextField label="이름" value={formData.username} onChange={handleChange("username")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />
            <TextField label="비밀번호" type="password" value={formData.password} onChange={handleChange("password")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />
            <TextField label="비밀번호 확인" type="password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />
            <TextField label="APP KEY" value={formData.appkey} onChange={handleChange("appkey")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />
            <TextField label="APP SECRET" type="password" value={formData.appsecret} onChange={handleChange("appsecret")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />
            <TextField label="계좌번호" value={formData.account} onChange={handleChange("account")} fullWidth InputLabelProps={{ style: { color: "#ffffff" } }} sx={inputStyle} />

            <Button
              variant="contained"
              onClick={handleSignup}
              sx={{
                mt: 1,
                bgcolor: "#7c3aed",
                fontWeight: 600,
                "&:hover": { bgcolor: "#6d28d9" },
              }}
            >
              회원가입
            </Button>

            <Button
              variant="text"
              sx={{ color: "#b5b5c5" }}
              onClick={() => navigate("/login")}
            >
              이미 계정이 있으신가요? 로그인하기
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 개선된 모달 적용 */}
      <LoginResultModal
        type={modalStatus.type}
        message={modalStatus.message}
        onClose={() => setModalStatus({ ...modalStatus, type: null })}
        actionLabel={modalStatus.type === 'success' ? "로그인하러 가기" : "다시 시도"}
        onAction={() => {
          if (modalStatus.type === 'success') {
            navigate("/login");
          }
          setModalStatus({ ...modalStatus, type: null });
        }}
      />
    </Box>
  );
}