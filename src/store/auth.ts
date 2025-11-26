import api from "../store/axios";

export const signupApi = async (data: {
  email: string;
  password: string;
  confirmPassword: string,
  username: string;
  appkey: string;
  appsecret: string;
}) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });
  return res.data;
};
