import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { AuthTokens, AuthUser, JwtPayload, LoginRequest } from '../models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly tokenExpiration = signal<number>(0);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    const exp = this.tokenExpiration();
    return user !== null && exp > Date.now();
  });

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginRequest): boolean {
    // --- Simulated JWT authentication ---
    if (credentials.email === 'admin@notes.com' && credentials.password === 'admin123') {
      const now = Date.now();
      const expiresIn = 3600; // 1 hour in seconds
      const payload: JwtPayload = {
        sub: 'usr_001',
        email: credentials.email,
        name: 'Admin User',
        iat: Math.floor(now / 1000),
        exp: Math.floor(now / 1000) + expiresIn,
      };
      const fakeToken = this.encodeJwt(payload);
      const tokens: AuthTokens = {
        accessToken: fakeToken,
        refreshToken: `refresh_${crypto.randomUUID()}`,
        expiresIn,
      };

      this.storeTokens(tokens);
      this.currentUser.set({ id: payload.sub, email: payload.email, name: payload.name });
      this.tokenExpiration.set(now + expiresIn * 1000);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.tokenExpiration.set(0);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private storeTokens(tokens: AuthTokens): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private restoreSession(): void {
    const token = this.getAccessToken();
    if (!token) return;

    const payload = this.decodeJwt(token);
    if (!payload) return;

    const expirationMs = payload.exp * 1000;
    if (expirationMs <= Date.now()) {
      this.logout();
      return;
    }

    this.currentUser.set({ id: payload.sub, email: payload.email, name: payload.name });
    this.tokenExpiration.set(expirationMs);
  }

  private encodeJwt(payload: JwtPayload): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = btoa('simulated-signature');
    return `${header}.${body}.${signature}`;
  }

  private decodeJwt(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1])) as JwtPayload;
    } catch {
      return null;
    }
  }
}
