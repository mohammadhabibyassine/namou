export interface RegisteredUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface BackendRegistrationResult {
  user: RegisteredUser;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface SessionUser {
  id: string;
  role: string;
  permissions: string[];
}

export interface BackendLoginResult extends TokenPair {
  user: SessionUser & { email: string };
}

export interface LoginResult {
  user: SessionUser;
}

export type AuthSessionResult = LoginResult;
export type RegistrationResult = LoginResult;

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Backward-compatibility aliases if needed
export type LoginRequest = LoginDto;
export type RegisterRequest = RegisterDto;
export type AuthResponse = LoginResult;
