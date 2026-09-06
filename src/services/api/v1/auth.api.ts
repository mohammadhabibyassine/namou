import axios from "axios";
import {
  LoginDto,
  LoginResult,
  RegisterDto,
  type RegistrationResult,
  type SessionUser,
} from "@/types/api/auth.types";

const authClient = axios.create({
  baseURL: "/api/auth",
  timeout: 15_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

export const registerUser = async (
  input: RegisterDto,
): Promise<RegistrationResult> => {
  const response = await authClient.post<RegistrationResult>(
    "/register",
    input,
  );
  return response.data;
};

export const loginUser = async (input: LoginDto): Promise<LoginResult> => {
  const response = await authClient.post<LoginResult>("/login", input);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await authClient.post("/logout", {});
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const response = await authClient.get<{ user: SessionUser | null }>(
    "/session",
  );
  return response.data.user;
};
