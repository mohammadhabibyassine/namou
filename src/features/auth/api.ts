import {
  getSessionUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/services/api/v1/auth.api";
import type { LoginInput, RegisterInput } from "./schemas";

export const authApi = {
  login: (input: LoginInput) => loginUser(input),
  register: (input: RegisterInput) => registerUser(input),
  logout: logoutUser,
  session: async () => ({ user: await getSessionUser() }),
};
