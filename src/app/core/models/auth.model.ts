export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: AuthUser;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}
