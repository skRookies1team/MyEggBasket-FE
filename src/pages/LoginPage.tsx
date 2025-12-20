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

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  /* ---------------- handlers ---------------- */
  const handleLoginChange =
    (field: keyof typeof loginData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setLoginData({ ...loginData, [field]: e.target.value });
    };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const handleLogin = async () => {
    try {
      await login(loginData);
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? "로그인 실패");
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
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
      {/* 로그인 카드 */}
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

    </Box>
  );
}
