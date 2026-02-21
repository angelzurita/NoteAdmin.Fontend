export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
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
}
